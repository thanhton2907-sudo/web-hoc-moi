// Đọc chữ từ PDF / Word (.docx) / ảnh (OCR) / TXT.
// Không cần "npm install" thêm gì: các bộ đọc được tải từ CDN (jsDelivr) khi lần đầu dùng.

const PDFJS_VERSION = '4.10.38';
const PDFJS_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build`;
const MAMMOTH_URL = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

const ext = (name = '') => name.split('.').pop().toLowerCase();

const loadScript = (url, globalName) =>
  new Promise((resolve, reject) => {
    if (window[globalName]) return resolve(window[globalName]);
    const el = document.createElement('script');
    el.src = url;
    el.async = true;
    el.onload = () => (window[globalName] ? resolve(window[globalName]) : reject(new Error(`Không khởi tạo được ${globalName}`)));
    el.onerror = () => reject(new Error('Không tải được bộ đọc tài liệu. Hãy kiểm tra kết nối internet rồi thử lại.'));
    document.head.appendChild(el);
  });

// ---------- OCR (ảnh, PDF scan) ----------
let ocrWorkerPromise = null;
const getOcrWorker = async () => {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = loadScript(TESSERACT_URL, 'Tesseract')
      .then((T) => T.createWorker('vie+eng'))
      .catch((e) => {
        ocrWorkerPromise = null;
        throw e;
      });
  }
  return ocrWorkerPromise;
};

const ocrImage = async (source, onStatus) => {
  onStatus?.('Đang nhận dạng chữ trong ảnh (lần đầu cần 20–40 giây để tải dữ liệu tiếng Việt)...');
  const worker = await getOcrWorker();
  const { data } = await worker.recognize(source);
  return data.text || '';
};

// ---------- PDF ----------
let pdfjsPromise = null;
const getPdfjs = async () => {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const lib = await import(/* @vite-ignore */ `${PDFJS_BASE}/pdf.min.mjs`);
      try {
        const blob = await (await fetch(`${PDFJS_BASE}/pdf.worker.min.mjs`)).blob();
        lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch {
        lib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
      }
      return lib;
    })().catch((e) => {
      pdfjsPromise = null;
      throw new Error('Không tải được bộ đọc PDF. Hãy kiểm tra kết nối internet rồi thử lại.');
    });
  }
  return pdfjsPromise;
};

const extractPdf = async (file, onStatus) => {
  onStatus?.('Đang tải bộ đọc PDF...');
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus?.(`Đang đọc trang ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let lastY = null;
    let line = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = Math.round(item.transform[5]);
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        text += line.trim() + '\n';
        line = '';
      }
      line += item.str + (item.hasEOL ? '\n' : ' ');
      lastY = y;
    }
    text += line.trim() + '\n\n';
  }

  // PDF scan (không có lớp chữ) -> OCR từng trang
  if (text.replace(/\s/g, '').length < 30) {
    let ocrText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      onStatus?.(`PDF dạng ảnh scan, đang nhận dạng chữ trang ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      ocrText += (await ocrImage(canvas, onStatus)) + '\n\n';
    }
    return ocrText;
  }
  return text;
};

// ---------- Word ----------
const extractDocx = async (file, onStatus) => {
  onStatus?.('Đang tải bộ đọc Word...');
  const mammoth = await loadScript(MAMMOTH_URL, 'mammoth');
  onStatus?.('Đang đọc file Word và trích xuất nội dung & hình ảnh...');

  try {
    const options = {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read("base64").then((b64) => {
          return {
            src: "data:" + image.contentType + ";base64," + b64
          };
        });
      })
    };
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }, options);
    
    // Giữ nguyên vị trí ảnh bằng thẻ [IMAGE:dataUrl] và chuyển đổi HTML thành text chuẩn
    let processed = html
      .replace(/<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/gi, '\n[IMAGE:$1]\n')
      .replace(/<\/p>|<\/div>|<br\s*\/?>|<\/tr>|<\/h[1-6]>/gi, '\n')
      .replace(/<td[^>]*>/gi, ' | ')
      .replace(/<\/td>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    return processed;
  } catch (err) {
    console.warn('Lỗi trích xuất Word nâng cao, chuyển sang đọc thuần:', err);
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value;
  }
};

// Đọc ảnh dưới dạng Base64 Data URL để lưu trữ và hiển thị
export const readImageAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// ---------- Hàm chính ----------
export const extractTextFromFile = async (file, onStatus) => {
  const type = ext(file.name);
  if (type === 'txt') return file.text();
  if (type === 'pdf') return extractPdf(file, onStatus);
  if (type === 'docx') return extractDocx(file, onStatus);
  if (type === 'doc') {
    throw new Error('File .doc (Word cũ) chưa đọc được. Hãy mở bằng Word rồi "Lưu thành" định dạng .docx.');
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(type)) {
    const dataUrl = await readImageAsDataUrl(file);
    const text = await ocrImage(file, onStatus);
    return `[IMAGE:${dataUrl}]\n${text}`;
  }
  throw new Error('Định dạng chưa hỗ trợ. Hãy dùng PDF, DOCX, TXT hoặc ảnh (PNG/JPG/WEBP).');
};
