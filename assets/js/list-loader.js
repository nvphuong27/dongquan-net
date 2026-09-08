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

  // item.type chỉ có với file không phải HTML (ví dụ "pdf"). Những file này mở
  // ở tab mới để không mất trang danh sách, và có nhãn loại file cho dễ nhận ra.
  function renderItem(item) {
    const type = item.type ? String(item.type).toUpperCase() : null;
    const newTab = type ? ' target="_blank" rel="noopener"' : '';
    return `
        <a class="item-card" href="${folder}${encodeURIComponent(item.file)}"${newTab}>
          <div>
            <h3>${type ? `<span class="file-tag">${escapeHtml(type)}</span>` : ''}${escapeHtml(item.title || item.file)}</h3>
            ${item.date ? `<span class="meta">${escapeHtml(item.date)}</span>` : ''}
          </div>
          <span class="arrow">${type ? '↗' : '→'}</span>
        </a>`;
  }

  fetch(folder + 'index.json', { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('Không đọc được index.json');
      return res.json();
    })
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        target.innerHTML = '<p class="empty-state">No posts yet — new content coming soon, check back later!</p>';
        return;
      }
      target.innerHTML = items.map(renderItem).join('');
    })
    .catch(err => {
      console.error(err);
      target.innerHTML = '<p class="empty-state">⚠️ Could not load the list. Please check the index.json file.</p>';
    });
})();
