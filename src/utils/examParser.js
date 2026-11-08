// Tách văn bản thô (từ PDF / Word / ảnh OCR) thành đề thi có cấu trúc.
// Hỗ trợ: "Câu 1.", "Bài 1:", "Question 1", "1." ; đáp án A/B/C/D (xuống dòng hoặc cùng dòng);
// đáp án cuối đề ("Đáp án: 1-A 2-B ...") hoặc ngay sau câu ("Đáp án: B");
// Tự động phân tách 2 phần Toán: Phần I (Trắc nghiệm) và Phần II (Tự luận);
// Tự động tách câu hỏi điền đáp án chứa nhiều phép tính/nhiều chỗ trống thành từng ý riêng biệt.
import { splitMultiItemQuestion } from './multiItemSplitter.js';

const Q_START = /^\s*(?:(?:câu|cau|bài|bai|question|q)\s*\.?\s*(\d{1,3})\s*[.:)\-–]?|(\d{1,3})\s*[.)])\s*(.*)$/i;
const OPT_START = /^\s*\(?([A-Da-d])[.)]\s*(.*)$/;
const ANSWER_LINE = /^\s*(?:đáp\s*án|dap\s*an|answers?|key|đ\/?a|hướng\s*dẫn\s*chấm)\s*[:\-–]?\s*(.*)$/i;
const EXPLAIN_LINE = /^\s*(?:giải\s*thích|lời\s*giải|hướng\s*dẫn\s*giải|explanation|giai\s*thich)\s*[:\-–]?\s*(.*)$/i;
const AUDIO_LINE = /^\s*(?:audio|script|transcript|nghe|listen)\s*[:\-–]\s*(.+)$/i;
const IMAGE_TAG = /\[IMAGE:\s*([^\]]+)\s*\]/i;
const BLANK = /\.{3,}|…|_{2,}|\(\s*\)/;
// Nhận diện phân mục Phần I (Trắc nghiệm) và Phần II (Tự luận)
const SECTION_CHOICE = /^\s*(?:phần|phan|part)?\s*(?:i|1|a)\s*[:.\-–]?\s*(?:trắc\s*nghiệm|trac\s*nghiem|khách\s*quan)/i;
const SECTION_ESSAY = /^\s*(?:phần|phan|part)?\s*(?:ii|2|b)\s*[:.\-–]?\s*(?:tự\s*luận|tu\s*luan)/i;
// Thẻ chỉ định loại câu ngay trong đề: [TN] / [Điền] / [Nhập] / [Tự luận]
const TAG = /\[\s*(tn|trắc\s*nghiệm|trac\s*nghiem|mc|điền|dien|nhập|nhap|điền\s*đáp\s*án|nhập\s*đáp\s*án|fill|tl|tự\s*luận|tu\s*luan|essay)\s*\]/i;
const tagToType = (t) => {
  const x = t.toLowerCase().replace(/\s+/g, '');
  if (['tn', 'trắcnghiệm', 'tracnghiem', 'mc'].includes(x)) return 'choice';
  if (['tl', 'tựluận', 'tuluan', 'essay'].includes(x)) return 'essay';
  return 'fill';
};
// Câu không có lựa chọn nhưng thực chất là "nhập đáp án" (tính, điền số, tìm x...)
const LOOKS_FILL = /^(tính|tìm|điền|đặt tính|hãy tính|số nào|viết số|so sánh|calculate|fill|write the)\b|[=]\s*[?…._\s]*$|\d\s*[+\-−×x*÷:/]\s*\d.*[=?]/i;

export const normalizeText = (raw = '') =>
  raw
    .replace(/\r/g, '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Tách "A. 3 B. 5 C. 7 D. 9" nằm cùng một dòng thành nhiều dòng
const splitInlineOptions = (line) => {
  const marks = [...line.matchAll(/(?:^|\s)\(?([A-D])[.)]\s/g)];
  if (marks.length < 2) return [line];
  const parts = [];
  const first = marks[0].index + (marks[0][0].startsWith(' ') ? 1 : 0);
  if (first > 0 && line.slice(0, first).trim()) parts.push(line.slice(0, first).trim());
  marks.forEach((m, i) => {
    const start = m.index + (m[0].startsWith(' ') ? 1 : 0);
    const end = i + 1 < marks.length ? marks[i + 1].index : line.length;
    parts.push(line.slice(start, end).trim());
  });
  return parts;
};

const parseKeyPairs = (text) => {
  const map = {};
  for (const m of text.matchAll(/(?:câu|cau)?\s*(\d{1,3})\s*[.:)\-–=]*\s*([A-Da-d])\b/gi)) {
    map[Number(m[1])] = m[2].toUpperCase();
  }
  return map;
};

const guessMeta = (text) => {
  const lower = text.toLowerCase();
  const gradeMatch = lower.match(/lớp\s*([1-5])\b|grade\s*([1-5])\b/);
  let subjectId = null;
  if (/tiếng anh|english|listen|vocabulary/.test(lower)) subjectId = 'english';
  else if (/tiếng việt|chính tả|tập làm văn|luyện từ/.test(lower)) subjectId = 'vietnamese';
  else subjectId = 'math';
  return {
    grade: gradeMatch ? Number(gradeMatch[1] || gradeMatch[2]) : null,
    subjectId,
  };
};

export const parseExamText = (rawText) => {
  const text = normalizeText(rawText);
  const warnings = [];
  if (!text) return { title: '', questions: [], warnings: ['Không đọc được chữ nào trong tài liệu.'], meta: {} };

  let lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap(splitInlineOptions);

  // Đề không đánh số (ví dụ Word dùng danh sách tự động): dòng ngay trước "A." là đề câu hỏi
  if (!lines.some((l) => Q_START.test(l) && !OPT_START.test(l))) {
    let n = 0;
    const out = [];
    lines.forEach((l, i) => {
      const next = lines[i + 1] || '';
      const isOpt = OPT_START.test(l);
      if (!isOpt && !ANSWER_LINE.test(l) && /^\(?[Aa][.)]\s/.test(next)) {
        n += 1;
        out.push(`Câu ${n}. ${l}`);
      } else out.push(l);
    });
    lines = out;
  }

  const blocks = [];
  const preamble = [];
  let preambleImage = null;
  let cur = null;
  let keyMap = {};
  let inKeySection = false;
  let currentSection = null; // 'choice' | 'essay'

  for (const line of lines) {
    if (inKeySection) {
      Object.assign(keyMap, parseKeyPairs(line));
      continue;
    }

    // Nhận diện thẻ hình ảnh [IMAGE:...]
    const imgMatch = line.match(IMAGE_TAG);
    if (imgMatch) {
      const imgData = imgMatch[1].trim();
      if (cur) {
        cur.image = imgData;
      } else {
        preambleImage = imgData;
      }
      continue;
    }

    // Nhận diện phân mục Phần I (Trắc nghiệm) và Phần II (Tự luận)
    if (SECTION_CHOICE.test(line)) {
      currentSection = 'choice';
      continue;
    }
    if (SECTION_ESSAY.test(line)) {
      currentSection = 'essay';
      continue;
    }

    const ans = line.match(ANSWER_LINE);
    if (ans) {
      const rest = ans[1].trim();
      const pairs = parseKeyPairs(rest);
      const hasPairs = Object.keys(pairs).length > 0;
      if (hasPairs) {
        Object.assign(keyMap, pairs);
        inKeySection = true; // phần bảng đáp án cuối đề
      } else if (cur && rest) {
        cur.inlineAnswer = rest.replace(/^[A-Da-d][.)]?$/, (s) => s[0].toUpperCase());
      } else if (!cur || !rest) {
        inKeySection = true; // tiêu đề "ĐÁP ÁN" đứng một mình, các dòng sau là bảng đáp án
      }
      continue;
    }

    const q = line.match(Q_START);
    // "1. Hello" là câu mới; nhưng "A. ..." không bao giờ là câu mới
    if (q && !OPT_START.test(line)) {
      cur = { 
        number: Number(q[1] || q[2]), 
        stem: [q[3] || ''], 
        options: [], 
        extra: [],
        section: currentSection
      };
      blocks.push(cur);
      continue;
    }

    if (!cur) {
      preamble.push(line);
      continue;
    }

    const ex = line.match(EXPLAIN_LINE);
    if (ex) {
      cur.explanation = ex[1];
      cur.mode = 'explain';
      continue;
    }
    const au = line.match(AUDIO_LINE);
    if (au) {
      cur.audioText = au[1].trim();
      continue;
    }
    const opt = line.match(OPT_START);
    if (opt) {
      cur.options.push({ letter: opt[1].toUpperCase(), text: opt[2].trim() });
      cur.mode = 'option';
      continue;
    }

    // dòng nối tiếp
    if (cur.mode === 'explain') cur.explanation = `${cur.explanation} ${line}`.trim();
    else if (cur.mode === 'option' && cur.options.length) cur.options[cur.options.length - 1].text += ` ${line}`;
    else cur.stem.push(line);
  }

  const total = blocks.length || 1;
  const perQ = Math.round((10 / total) * 4) / 4;
  const numbers = blocks.map((b) => b.number);
  const numbersUnique = new Set(numbers).size === numbers.length;

  const questions = blocks.map((b, i) => {
    let question = b.stem.join(' ').replace(/\s+/g, ' ').trim() || `Câu ${b.number}`;
    let questionImage = b.image || null;
    const stemImgMatch = question.match(IMAGE_TAG);
    if (stemImgMatch) {
      questionImage = stemImgMatch[1].trim();
      question = question.replace(stemImgMatch[0], '').trim();
    }

    let givenPoints = null;
    const pm = question.match(/\(\s*(\d+(?:[.,]\d+)?)\s*(?:điểm|đ|diem|pts?|points?)\s*\)/i);
    if (pm) {
      givenPoints = Number(pm[1].replace(',', '.'));
      question = question.replace(pm[0], '').replace(/^[\s.:)\-–]+/, '').replace(/\s+/g, ' ').trim();
    }
    let forced = null;
    const tm = question.match(TAG);
    if (tm) {
      forced = tagToType(tm[1]);
      question = question.replace(tm[0], '').replace(/\s+/g, ' ').trim();
    }
    const id = `q-doc-${i + 1}`;
    const last = i === blocks.length - 1;
    const points = last ? Math.round((10 - perQ * (blocks.length - 1)) * 100) / 100 : perQ;
    const base = { 
      id, 
      points: givenPoints ?? points, 
      explanation: b.explanation || '', 
      number: b.number,
      image: questionImage || (i === 0 ? preambleImage : null),
      imageSize: 'medium'
    };
    if (b.audioText) base.audioText = b.audioText;

    if (forced === 'choice' && b.options.length < 2) {
      warnings.push(`Câu ${i + 1}: được gắn [TN] nhưng không có đủ lựa chọn A/B/C/D.`);
    }
    if (b.options.length >= 2 && forced !== 'fill' && forced !== 'essay') {
      const letter = (b.inlineAnswer && /^[A-D]$/i.test(b.inlineAnswer) ? b.inlineAnswer : keyMap[numbersUnique ? b.number : i + 1]) || '';
      const found = b.options.find((o) => o.letter === letter.toUpperCase());
      if (!found) warnings.push(`Câu ${i + 1}: chưa tìm thấy đáp án đúng, hãy chọn lại.`);
      return {
        ...base,
        type: b.audioText ? 'listen-choice' : 'multiple-choice',
        section: b.section || 'choice',
        question,
        options: b.options.map((o) => o.text),
        answer: found ? found.text : '',
      };
    }

    if (forced === 'essay') {
      return { 
        ...base, 
        type: 'essay', 
        section: b.section || 'essay',
        question, 
        answer: '', 
        sampleAnswer: b.inlineAnswer || '' 
      };
    }

    if (forced === 'fill' || BLANK.test(question) || b.inlineAnswer || LOOKS_FILL.test(question)) {
      // Tự động phân tích và tách câu hỏi điền đáp án chứa nhiều phép tính/nhiều chỗ trống thành từng ý riêng biệt
      const multi = splitMultiItemQuestion(question, base.points);
      if (multi && multi.items && multi.items.length >= 2) {
        return {
          ...base,
          type: 'fill-in',
          section: b.section || 'essay',
          question: multi.title,
          subQuestions: multi.items,
          answer: multi.items.map(it => it.answer).filter(Boolean).join(', ')
        };
      }

      const answer = b.inlineAnswer || '';
      if (!answer) warnings.push(`Câu ${i + 1}: câu nhập đáp án nhưng chưa có đáp án đúng.`);
      return { 
        ...base, 
        type: b.audioText ? 'listen-dictation' : 'fill-in', 
        section: b.section || 'essay',
        question, 
        answer 
      };
    }

    return { 
      ...base, 
      type: 'essay', 
      section: b.section || 'essay',
      question, 
      answer: '', 
      sampleAnswer: b.inlineAnswer || '' 
    };
  });

  if (!questions.length) {
    warnings.push('Không nhận ra câu hỏi nào. Hãy đánh số dạng "Câu 1.", "1." hoặc "Question 1".');
  }

  const title = preamble.find((l) => l.length > 6 && l.length < 140) || '';
  return { title, questions, warnings, meta: guessMeta(text) };
};
