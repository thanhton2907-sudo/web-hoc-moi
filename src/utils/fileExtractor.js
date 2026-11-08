import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Cấu hình worker cho pdfjs trong môi trường browser/Vite
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

// Trích xuất văn bản thuần sạch 100% từ Word .docx, PDF hoặc Text
export const extractTextFromFile = async (file) => {
  if (!file) return '';

  const fileName = file.name.toLowerCase();

  // 1. File Word .docx
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || '';
    } catch (err) {
      console.warn('Lỗi đọc Word bằng mammoth, chuyển sang đọc thô:', err);
      return await readTextPlain(file);
    }
  }

  // 2. File PDF
  if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map(item => item.str);
        fullText += pageStrings.join(' ') + '\n\n';
      }

      return fullText;
    } catch (err) {
      console.warn('Lỗi đọc PDF bằng pdfjs:', err);
      return '';
    }
  }

  // 3. File văn bản .txt hoặc file khác
  return await readTextPlain(file);
};

const readTextPlain = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    reader.readAsText(file, 'UTF-8');
  });
};
