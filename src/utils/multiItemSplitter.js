// Bộ phân tích và tự động tách câu hỏi điền đáp án thành từng ý riêng biệt
// Hỗ trợ tính toán tiểu học (+, -, *, x, :, /), điền số khuyết, và câu có nhiều chỗ trống

export const BLANK_REGEX = /(?:\.{2,}|…+|_{2,}|\?+|\[\s*\.\.\.\s*\]|\[\s*\])/g;

/**
 * Tính toán biểu thức số học đơn giản (cộng, trừ, nhân, chia)
 */
export function evalSimpleMath(aStr, op, bStr) {
  const a = parseFloat(String(aStr).replace(',', '.'));
  const b = parseFloat(String(bStr).replace(',', '.'));
  if (isNaN(a) || isNaN(b)) return '';

  let res = null;
  switch (op) {
    case '+':
      res = a + b;
      break;
    case '-':
    case '−':
    case '–':
      res = a - b;
      break;
    case '*':
    case 'x':
    case 'X':
    case '×':
      res = a * b;
      break;
    case ':':
    case '÷':
    case '/':
      if (b !== 0) res = a / b;
      break;
    default:
      return '';
  }
  if (res === null) return '';
  return Number.isInteger(res) ? String(res) : String(Math.round(res * 100) / 100);
}

/**
 * Tìm số còn thiếu trong phép tính dạng a op b = c với 1 vị trí là chỗ trống
 */
export function evalMissingNumber(num1Str, op, num2Str, resultStr, blankPos) {
  const n1 = num1Str ? parseFloat(String(num1Str).replace(',', '.')) : null;
  const n2 = num2Str ? parseFloat(String(num2Str).replace(',', '.')) : null;
  const res = resultStr ? parseFloat(String(resultStr).replace(',', '.')) : null;

  if (blankPos === 'res' && n1 !== null && n2 !== null) {
    return evalSimpleMath(n1, op, n2);
  } else if (blankPos === 'left' && n2 !== null && res !== null) {
    // ? + b = c => ? = c - b
    if (op === '+') return String(res - n2);
    // ? - b = c => ? = c + b
    if (op === '-' || op === '−' || op === '–') return String(res + n2);
    // ? * b = c => ? = c / b
    if (op === '*' || op === 'x' || op === 'X' || op === '×') return n2 !== 0 ? String(res / n2) : '';
    // ? : b = c => ? = c * b
    if (op === ':' || op === '÷' || op === '/') return String(res * n2);
  } else if (blankPos === 'mid' && n1 !== null && res !== null) {
    // a + ? = c => ? = c - a
    if (op === '+') return String(res - n1);
    // a - ? = c => ? = a - c
    if (op === '-' || op === '−' || op === '–') return String(n1 - res);
    // a * ? = c => ? = c / a
    if (op === '*' || op === 'x' || op === 'X' || op === '×') return n1 !== 0 ? String(res / n1) : '';
    // a : ? = c => ? = a / c
    if (op === ':' || op === '÷' || op === '/') return res !== 0 ? String(n1 / res) : '';
  }
  return '';
}

/**
 * Phân tích và tự động tách chuỗi câu hỏi thành từng ý nhỏ độc lập
 * @param {string} rawText Nội dung câu hỏi gốc của giáo viên
 * @param {number} totalPoints Tổng số điểm của câu hỏi (mặc định 2.0)
 * @returns {object|null} Đối tượng chứa danh sách subQuestions nếu tách được, hoặc null nếu là câu đơn bình thường
 */
export function splitMultiItemQuestion(rawText, totalPoints = 2.0) {
  if (!rawText || typeof rawText !== 'string') return null;
  const clean = rawText.replace(/\r/g, '').trim();

  // Dạng 1: Các phép tính chuẩn có dấu = (Ví dụ: 4 x 9 = .......... 7 x 3 = ..........)
  // Bắt mẫu: nhãn tuỳ chọn dạng (a) hoặc a) hoặc 1. rồi đến số phép_tính số = chỗ_trống
  const calcPattern = /(?:(?:(?:\(([a-zA-Z\d]{1,2})\)|(?:^|[\s;,])([a-zA-Z\d]{1,2})[.)\]\-])\s*)?)(\d+(?:[.,]\d+)?)\s*([+\-−–*xX×÷:/])\s*(\d+(?:[.,]\d+)?)\s*=\s*(?:\.{2,}|…+|_{2,}|\?+|\[\s*\])?/g;
  const calcMatches = [...clean.matchAll(calcPattern)];

  if (calcMatches.length >= 2) {
    // Trích xuất lời dẫn ban đầu (trước phép tính đầu tiên)
    const firstIdx = calcMatches[0].index;
    let prefix = clean.substring(0, firstIdx).trim();
    prefix = prefix.replace(/^(?:câu|cau|bài|bai)\s*\d+[\s.:)\-–]*/i, '').trim();
    prefix = prefix.replace(/[:\-–]+$/, '').trim();
    if (!prefix || prefix.length < 2) prefix = 'Tính nhẩm các phép tính sau:';

    const pointsPerItem = Math.round((totalPoints / calcMatches.length) * 100) / 100;

    const items = calcMatches.map((m, idx) => {
      const label = m[1] || m[2] || `${idx + 1}`;
      const num1 = m[3];
      const op = m[4];
      const num2 = m[5];
      // Chuẩn hóa ký hiệu nhân chia cho học sinh tiểu học dễ đọc
      const normOp = (op === 'x' || op === 'X' || op === '*') ? '×' : (op === '/' || op === ':') ? ':' : op;
      const prompt = `${num1} ${normOp} ${num2} =`;
      const answer = evalSimpleMath(num1, op, num2);

      return {
        id: `sub-${idx + 1}`,
        label: String(label),
        prompt,
        answer: String(answer),
        points: pointsPerItem,
        explanation: `${prompt} ${answer}`
      };
    });

    return {
      isMultiItem: true,
      title: prefix,
      items
    };
  }

  // Dạng 2: Phép tính tìm số còn thiếu (Ví dụ: 4 x ..... = 36    ..... : 8 = 7)
  const missingPattern = /(?:(?:(?:\(([a-zA-Z\d]{1,2})\)|(?:^|[\s;,])([a-zA-Z\d]{1,2})[.)\]\-])\s*)?)(?:(\d+(?:[.,]\d+)?)|(?:\.{2,}|…+|_{2,}|\?+|\[\s*\]))\s*([+\-−–*xX×÷:/])\s*(?:(\d+(?:[.,]\d+)?)|(?:\.{2,}|…+|_{2,}|\?+|\[\s*\]))\s*=\s*(?:(\d+(?:[.,]\d+)?)|(?:\.{2,}|…+|_{2,}|\?+|\[\s*\]))/g;
  const missingMatches = [...clean.matchAll(missingPattern)];

  if (missingMatches.length >= 2) {
    const firstIdx = missingMatches[0].index;
    let prefix = clean.substring(0, firstIdx).trim();
    prefix = prefix.replace(/^(?:câu|cau|bài|bai)\s*\d+[\s.:)\-–]*/i, '').trim();
    prefix = prefix.replace(/[:\-–]+$/, '').trim();
    if (!prefix) prefix = 'Điền số thích hợp vào chỗ trống:';

    const pointsPerItem = Math.round((totalPoints / missingMatches.length) * 100) / 100;

    const items = missingMatches.map((m, idx) => {
      const label = m[1] || m[2] || `${idx + 1}`;
      const num1Str = m[3];
      const op = m[4];
      const num2Str = m[5];
      const resStr = m[6];
      const normOp = (op === 'x' || op === 'X' || op === '*') ? '×' : (op === '/' || op === ':') ? ':' : op;

      let blankPos = 'res';
      if (!num1Str) blankPos = 'left';
      else if (!num2Str) blankPos = 'mid';

      const prompt = blankPos === 'left' ? `... ${normOp} ${num2Str} = ${resStr}`
                   : blankPos === 'mid' ? `${num1Str} ${normOp} ... = ${resStr}`
                   : `${num1Str} ${normOp} ${num2Str} =`;

      const answer = evalMissingNumber(num1Str, op, num2Str, resStr, blankPos);

      return {
        id: `sub-${idx + 1}`,
        label: String(label),
        prompt,
        answer: String(answer),
        points: pointsPerItem,
        explanation: `${prompt.replace('...', answer)}`
      };
    });

    return {
      isMultiItem: true,
      title: prefix,
      items
    };
  }

  // Dạng 3: Các vế câu ngăn cách bằng dấu chấm phẩy, xuống dòng hoặc chữ a), b), c) có chỗ trống
  // (Ví dụ: "Điền số: 1 tuần lễ có ..... ngày; 1 ngày có ..... giờ; 1 giờ có ..... phút")
  let mainTitle = 'Điền từ / số thích hợp vào chỗ trống:';
  let bodyToSplit = clean;

  const headerPrefixMatch = clean.match(/^([^:;\n]{2,40}):\s*([\s\S]+)$/);
  if (headerPrefixMatch) {
    mainTitle = headerPrefixMatch[1].trim();
    bodyToSplit = headerPrefixMatch[2].trim();
  }

  const clauseDelim = /[;\n]+/;
  const rawClauses = bodyToSplit.split(clauseDelim).map(c => c.trim()).filter(Boolean);
  const clausesWithBlank = rawClauses.filter(c => /(?:\.{2,}|…+|_{2,}|\?+|\[\s*\])/.test(c));

  if (clausesWithBlank.length >= 2) {
    const pointsPerItem = Math.round((totalPoints / clausesWithBlank.length) * 100) / 100;
    const items = clausesWithBlank.map((c, idx) => {
      const labelMatch = c.match(/^(?:\(?([a-z\d]+)\)|([a-z\d]+)[.:)\-])\s*(.*)$/i);
      const label = labelMatch ? (labelMatch[1] || labelMatch[2]) : `${idx + 1}`;
      const promptText = labelMatch ? labelMatch[3] : c;

      return {
        id: `sub-${idx + 1}`,
        label: String(label),
        prompt: promptText.replace(/(?:\.{2,}|…+|_{2,}|\?+|\[\s*\])/g, '.....'),
        answer: '',
        points: pointsPerItem,
        explanation: ''
      };
    });

    return {
      isMultiItem: true,
      title: mainTitle,
      items
    };
  }

  // Dạng 4: Một câu văn đơn có từ 2 chỗ trống trở lên nhưng không tách được thành các vế độc lập
  // (Ví dụ: "Hình chữ nhật có ..... góc vuông và có các cặp cạnh đối diện ..... với nhau.")
  const blanks = [...clean.matchAll(new RegExp(BLANK_REGEX.source, 'g'))];
  if (blanks.length >= 2) {
    const pointsPerItem = Math.round((totalPoints / blanks.length) * 100) / 100;
    const items = blanks.map((_, idx) => ({
      id: `sub-${idx + 1}`,
      label: `Chỗ trống ${idx + 1}`,
      prompt: `Chỗ trống (${idx + 1}):`,
      answer: '',
      points: pointsPerItem,
      explanation: ''
    }));

    return {
      isMultiItem: true,
      title: clean,
      isSentenceFill: true,
      items
    };
  }

  return null;
}

/**
 * Kiểm tra xem câu hỏi có chứa nhiều ý / phép tính cần tách hay không
 */
export function hasSubItems(question) {
  if (question?.subQuestions && Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
    return true;
  }
  const check = splitMultiItemQuestion(question?.question || '');
  return !!check && check.items.length >= 2;
}

/**
 * Chấm điểm câu hỏi có nhiều ý nhỏ
 * @param {object} question Câu hỏi chứa subQuestions
 * @param {object} userAnswers Bảng câu trả lời của học sinh (ex: { 'q1_sub-1': '36', 'q1_sub-2': '21' })
 * @returns {object} { earnedPoints, totalPoints, correctCount, totalCount, details }
 */
export function gradeMultiItemQuestion(question, userAnswers = {}) {
  const subs = question.subQuestions || [];
  let earnedPoints = 0;
  let totalPoints = 0;
  let correctCount = 0;
  const details = [];

  subs.forEach((sub, idx) => {
    const subKey = `${question.id}_${sub.id || idx}`;
    const userAns = userAnswers[subKey] !== undefined ? String(userAnswers[subKey]).trim() : '';
    const expectedAns = String(sub.answer || '').trim();
    const p = typeof sub.points === 'number' ? sub.points : (question.points || 2) / subs.length;
    totalPoints += p;

    // So sánh đáp án (chuẩn hóa chữ hoa/thường và khoảng trắng)
    const isCorrect = userAns.length > 0 && expectedAns.length > 0 && (
      userAns.toLowerCase() === expectedAns.toLowerCase() ||
      userAns.replace(/\s+/g, '') === expectedAns.replace(/\s+/g, '')
    );

    if (isCorrect) {
      earnedPoints += p;
      correctCount += 1;
    }

    details.push({
      subId: sub.id,
      label: sub.label,
      prompt: sub.prompt,
      userAns,
      expectedAns,
      isCorrect,
      points: p,
      earned: isCorrect ? p : 0
    });
  });

  return {
    earnedPoints: Math.round(earnedPoints * 100) / 100,
    totalPoints: Math.round(totalPoints * 100) / 100,
    correctCount,
    totalCount: subs.length,
    isAllCorrect: correctCount === subs.length,
    details
  };
}
