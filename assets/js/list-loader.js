// Script chung: đọc index.json trong 1 thư mục và render danh sách item-card.
// index.json được tự sinh bởi GitHub Actions (xem .github/workflows/build-index.yml)
(function () {
  const scriptTag = document.currentScript;
  const folder = scriptTag.getAttribute('data-folder'); // ví dụ "/grammar/"
  const targetId = scriptTag.getAttribute('data-target');
  const target = document.getElementById(targetId);

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  fetch(folder + 'index.json', { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('Không đọc được index.json');
      return res.json();
    })
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        target.innerHTML = '<p class="empty-state">Chưa có bài nào — sắp có bài mới, quay lại sau nhé!</p>';
        return;
      }
      target.innerHTML = items.map(item => `
        <a class="item-card" href="${folder}${encodeURIComponent(item.file)}">
          <div>
            <h3>${escapeHtml(item.title || item.file)}</h3>
            ${item.date ? `<span class="meta">${escapeHtml(item.date)}</span>` : ''}
          </div>
          <span class="arrow">→</span>
        </a>
      `).join('');
    })
    .catch(err => {
      console.error(err);
      target.innerHTML = '<p class="empty-state">⚠️ Chưa tải được danh sách. Kiểm tra lại file index.json.</p>';
    });
})();
