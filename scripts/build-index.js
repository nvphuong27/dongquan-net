#!/usr/bin/env node
// ==============================================================
// Quét các thư mục grammar/, extra/, blog/posts/ và tự sinh index.json
// Chạy tự động bởi GitHub Actions mỗi khi có push (xem
// .github/workflows/build-index.yml). Cũng có thể chạy tay:
//   node scripts/build-index.js
// ==============================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Mỗi target: folder cần quét + có sắp theo ngày (blog) hay không
const TARGETS = [
  { dir: 'grammar', sortByDate: false },
  { dir: 'extra', sortByDate: false },
  { dir: 'blog/posts', sortByDate: true },
];

function extractTitle(html, fallback) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : fallback;
}

function extractDateFromFilename(filename) {
  const m = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return { iso: `${y}-${mo}-${d}`, display: `${d}/${mo}/${y}` };
}

function buildFolder(target) {
  const dirPath = path.join(ROOT, target.dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Bỏ qua (không tồn tại): ${target.dir}`);
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f =>
    f.endsWith('.html') && f.toLowerCase() !== 'index.html'
  );

  let items = files.map(file => {
    const full = path.join(dirPath, file);
    const html = fs.readFileSync(full, 'utf-8');
    const title = extractTitle(html, file);
    const dateInfo = extractDateFromFilename(file);
    const item = { file, title };
    if (dateInfo) item.date = dateInfo.display;
    item._sortKey = dateInfo ? dateInfo.iso : file;
    return item;
  });

  if (target.sortByDate) {
    items.sort((a, b) => b._sortKey.localeCompare(a._sortKey)); // blog: mới nhất trước
  } else {
    items.sort((a, b) => a.file.localeCompare(b.file)); // grammar/extra: theo tên file tăng dần
  }

  items = items.map(({ _sortKey, ...rest }) => rest);

  const outPath = path.join(dirPath, 'index.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2) + '\n');
  console.log(`Đã cập nhật ${target.dir}/index.json (${items.length} mục)`);
}

TARGETS.forEach(buildFolder);
