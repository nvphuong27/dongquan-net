// Script chung: đọc index.json trong 1 thư mục và render danh sách item-card.
// index.json được tự sinh bởi GitHub Actions (xem .github/workflows/build-index.yml)
//
// Thuộc tính trên thẻ <script>:
//   data-folder  — thư mục chứa index.json, ví dụ "/grammar/"
//   data-target  — id của khung hiển thị danh sách
//   data-search  — (tuỳ chọn) id của ô <input> tìm kiếm theo tiêu đề
//   data-count   — (tuỳ chọn) id của thẻ hiển thị số kết quả tìm được
(function () {
  const scriptTag = document.currentScript;
  const folder = scriptTag.getAttribute('data-folder'); // ví dụ "/grammar/"
  const targetId = scriptTag.getAttribute('data-target');
  const target = document.getElementById(targetId);
  const searchInput = document.getElementById(scriptTag.getAttribute('data-search'));
  const countBox = document.getElementById(scriptTag.getAttribute('data-count'));

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // Bỏ dấu tiếng Việt + đưa về chữ thường, để gõ "hien tai don" vẫn tìm ra
  // "Hiện tại đơn". đ/Đ phải xử lý riêng vì không tách được bằng NFD.
  function normalize(str) {
    return String(str)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
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

  function setupSearch(items) {
    if (!searchInput) return;

    // Tìm trên cả tiêu đề lẫn tên file, mỗi từ trong ô tìm kiếm đều phải khớp.
    const haystacks = items.map(it => normalize(`${it.title || ''} ${it.file}`));

    function apply() {
      const words = normalize(searchInput.value).split(/\s+/).filter(Boolean);
      const matched = items.filter((_, i) => words.every(w => haystacks[i].includes(w)));

      if (matched.length === 0) {
        target.innerHTML = '<p class="empty-state">Không tìm thấy chủ điểm nào khớp — thử từ khoá khác nhé!</p>';
      } else {
        target.innerHTML = matched.map(renderItem).join('');
      }

      if (countBox) {
        countBox.textContent = words.length === 0
          ? `${items.length} chủ điểm`
          : `${matched.length}/${items.length} chủ điểm khớp với "${searchInput.value.trim()}"`;
      }
    }

    searchInput.addEventListener('input', apply);
    searchInput.disabled = false;
    apply();
  }

  fetch(folder + 'index.json', { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('Không đọc được index.json');
      return res.json();
    })
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        target.innerHTML = '<p class="empty-state">No posts yet — new content coming soon, check back later!</p>';
        if (countBox) countBox.textContent = '';
        return;
      }
      target.innerHTML = items.map(renderItem).join('');
      setupSearch(items);
    })
    .catch(err => {
      console.error(err);
      target.innerHTML = '<p class="empty-state">⚠️ Could not load the list. Please check the index.json file.</p>';
      if (countBox) countBox.textContent = '';
    });
})();
