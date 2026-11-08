const fs = require('fs');
const path = require('path');

const projectDir = 'C:/Users/thanh/.gemini/antigravity/scratch/vuihoc-tieuhoc';

// 1. TẠO FILE HTML DUY NHẤT CHẠY TRỰC TIẾP (STANDALONE SINGLE-FILE HTML)
// Người dùng chỉ cần nhấp đúp file này là web chạy ngay lập tức trên mọi trình duyệt
const distHtml = fs.readFileSync(path.join(projectDir, 'dist/index.html'), 'utf8');
const assetsDir = path.join(projectDir, 'dist/assets');
const jsFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.js'));
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));

const jsCode = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
const cssCode = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

// Nhúng CSS vào thẻ <style>
let standaloneHtml = distHtml.replace(
  /<link rel="stylesheet"[^>]*>/,
  '<style>\n' + cssCode + '\n</style>'
);

// Nhúng JavaScript vào thẻ <script type="module">
const safeJsCode = jsCode.replace(/<\/script>/gi, '<\\/script>');
standaloneHtml = standaloneHtml.replace(
  /<script type="module"[^>]*><\/script>/,
  '<script type="module">\n' + safeJsCode + '\n</script>'
);

const htmlDestinations = [
  'C:/Users/thanh/vuihoc-tieuhoc-standalone.html',
  'C:/Users/thanh/.gemini/antigravity/scratch/vuihoc-tieuhoc/vuihoc-tieuhoc-standalone.html',
  'C:/Users/thanh/.gemini/antigravity/brain/7ce6e6db-6a94-46e5-9fb7-7139eea5d0ef/vuihoc-tieuhoc-standalone.html'
];

htmlDestinations.forEach(dest => {
  fs.writeFileSync(dest, standaloneHtml, 'utf8');
});

console.log('1. Đã tạo file HTML Độc Lập Chạy Ngay: vuihoc-tieuhoc-standalone.html');

// 2. TẠO FILE TỔNG HỢP TOÀN BỘ MÃ NGUỒN CỦA TẤT CẢ CÁC FILE (FULL_SOURCE_CODE.txt)
const srcFiles = [];
function collectFiles(dir) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist') {
        collectFiles(fullPath);
      }
    } else if (item.endsWith('.jsx') || item.endsWith('.js') || item.endsWith('.css') || item.endsWith('.html') || item.endsWith('.json')) {
      if (item !== 'package-lock.json') {
        srcFiles.push(fullPath);
      }
    }
  }
}

collectFiles(path.join(projectDir, 'src'));
srcFiles.push(
  path.join(projectDir, 'index.html'),
  path.join(projectDir, 'package.json'),
  path.join(projectDir, 'vite.config.js'),
  path.join(projectDir, 'tailwind.config.js'),
  path.join(projectDir, 'README.md')
);

let fullCode = '================================================================================\n';
fullCode += '   TỔNG HỢP GỘP TOÀN BỘ MÃ NGUỒN DỰ ÁN HỌC VUI CẤP 1 (HỌC VUI 2.0) TRONG 1 FILE\n';
fullCode += '   Tổng số files đã gộp: ' + srcFiles.length + '\n';
fullCode += '   Thời gian xuất: ' + new Date().toLocaleString('vi-VN') + '\n';
fullCode += '================================================================================\n\n';

srcFiles.forEach((filePath, idx) => {
  const relPath = path.relative(projectDir, filePath).replace(/\\/g, '/');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  fullCode += '/* =============================================================================\n';
  fullCode += ` * [FILE ${idx + 1}/${srcFiles.length}] Đường dẫn: ${relPath}\n`;
  fullCode += ' * ============================================================================= */\n\n';
  fullCode += fileContent + '\n\n';
});

const txtDestinations = [
  'C:/Users/thanh/vuihoc-tieuhoc-full-code.txt',
  'C:/Users/thanh/.gemini/antigravity/scratch/vuihoc-tieuhoc/vuihoc-tieuhoc-full-code.txt',
  'C:/Users/thanh/.gemini/antigravity/brain/7ce6e6db-6a94-46e5-9fb7-7139eea5d0ef/vuihoc-tieuhoc-full-code.txt'
];

txtDestinations.forEach(dest => {
  fs.writeFileSync(dest, fullCode, 'utf8');
});

console.log('2. Đã tạo file gộp toàn bộ mã nguồn: vuihoc-tieuhoc-full-code.txt');
