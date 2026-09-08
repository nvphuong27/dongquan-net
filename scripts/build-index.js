#!/usr/bin/env node
// ==============================================================
// Quét các thư mục grammar/, extra/, long-term/, blog/posts/ và tự sinh
// index.json. Chạy tự động bởi GitHub Actions mỗi khi có push (xem
// .github/workflows/build-index.yml). Cũng có thể chạy tay:
//   node scripts/build-index.js
// ==============================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Mỗi target:
//   dir        — thư mục cần quét
//   sortByDate — true: mới nhất lên đầu (theo tiền tố YYYY-MM-DD trong tên file)
//   exts       — các đuôi file được đưa vào danh sách (mặc định chỉ .html)
const TARGETS = [
  { dir: 'grammar', sortByDate: false },
  { dir: 'extra', sortByDate: false },
  { dir: 'long-term', sortByDate: true, exts: ['.html', '.pdf'] },
  { dir: 'blog/posts', sortByDate: true },
];

const DEFAULT_EXTS = ['.html'];

function extractTitle(html, fallback) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : fallback;
}

// Nhận cả 2 kiểu đặt tên ngày ở đầu file:
//   "2026-09-04-book-report.pdf"        (có gạch)
//   "20260904 - Get ready for movers.pdf" (dính liền)
function extractDateFromFilename(filename) {
  const m = filename.match(/^(\d{4})-?(\d{2})-?(\d{2})(?!\d)/);
  if (!m) return null;
  const [, y, mo, d] = m;
  // Chặn trường hợp 8 chữ số đầu file không phải là ngày thật
  const month = Number(mo), day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { iso: `${y}-${mo}-${d}`, display: `${d}/${mo}/${y}` };
}

// File không phải HTML (ví dụ PDF) không có thẻ <title>, nên lấy tiêu đề từ
// chính tên file: bỏ đuôi, bỏ tiền tố ngày, đổi gạch ngang thành khoảng trắng.
//   "2026-09-04-reading-project.pdf" -> "Reading project"
function titleFromFilename(filename) {
  let name = filename
    .replace(/\.[^.]+$/, '')                            // bỏ đuôi file
    .replace(/^\d{4}-?\d{2}-?\d{2}\s*[-–—_]*\s*/, '');   // bỏ tiền tố ngày + dấu ngăn cách

  // Tên kiểu slug ("book-report") thì đổi gạch thành khoảng trắng.
  // Tên đã viết có khoảng trắng ("Get ready for movers") thì giữ nguyên,
  // để không phá những tiêu đề vốn có gạch nối như "Part-time work".
  if (!/\s/.test(name)) name = name.replace(/[-_]+/g, ' ');

  name = name.replace(/\s+/g, ' ').trim();
  if (!name) return filename;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildFolder(target) {
  const dirPath = path.join(ROOT, target.dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Bỏ qua (không tồn tại): ${target.dir}`);
    return;
  }

  const exts = target.exts || DEFAULT_EXTS;
  const files = fs.readdirSync(dirPath).filter(f => {
    if (f.toLowerCase() === 'index.html') return false;
    return exts.includes(path.extname(f).toLowerCase());
  });

  let items = files.map(file => {
    const ext = path.extname(file).toLowerCase();
    const isHtml = ext === '.html';
    const title = isHtml
      ? extractTitle(fs.readFileSync(path.join(dirPath, file), 'utf-8'), file)
      : titleFromFilename(file);

    const dateInfo = extractDateFromFilename(file);
    const item = { file, title };
    if (!isHtml) item.type = ext.slice(1); // "pdf" — để list-loader hiện nhãn & mở tab mới
    if (dateInfo) item.date = dateInfo.display;

    item._hasDate = !!dateInfo;
    item._sortKey = dateInfo ? dateInfo.iso : file;
    return item;
  });

  if (target.sortByDate) {
    // Mới nhất trước. File không có tiền tố ngày xếp xuống cuối, sắp theo tên.
    items.sort((a, b) => {
      if (a._hasDate !== b._hasDate) return a._hasDate ? -1 : 1;
      if (a._hasDate) return b._sortKey.localeCompare(a._sortKey);
      return a._sortKey.localeCompare(b._sortKey);
    });
  } else {
    items.sort((a, b) => a.file.localeCompare(b.file)); // grammar/extra: theo tên file tăng dần
  }

  items = items.map(({ _sortKey, _hasDate, ...rest }) => rest);

  const outPath = path.join(dirPath, 'index.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2) + '\n');
  console.log(`Đã cập nhật ${target.dir}/index.json (${items.length} mục)`);
}

TARGETS.forEach(buildFolder);
