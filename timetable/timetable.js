/* =========================================================
   Thời khoá biểu — Lớp 2/10, TH Trần Nhân Tông
   Sửa dữ liệu ở object TIMETABLE bên dưới là trang tự cập nhật.
   ========================================================= */

const TIMETABLE = {
  school:   'TH Trần Nhân Tông',
  schoolYear: 'Năm học 2026 – 2027 · Học kỳ 1',
  className: 'Lớp 2/10',
  teacher:  'Nguyễn Thị Như Huỳnh',
  sheetNo:  'Số 11',
  effectiveFrom: 'Thực hiện từ ngày 07/09/2026',

  days: [
    { key: 'mon', label: 'Thứ 2', short: 'T2', jsDay: 1 },
    { key: 'tue', label: 'Thứ 3', short: 'T3', jsDay: 2 },
    { key: 'wed', label: 'Thứ 4', short: 'T4', jsDay: 3 },
    { key: 'thu', label: 'Thứ 5', short: 'T5', jsDay: 4 },
    { key: 'fri', label: 'Thứ 6', short: 'T6', jsDay: 5 }
  ],

  // s = subject, t = teacher, r = room/ghi chú, x = tiết giáo viên bộ môn (in đỏ ở bản gốc)
  sessions: [
    {
      key: 'morning',
      label: 'Buổi sáng',
      icon: '🌤️',
      rows: [
        [
          { s: 'Chào cờ',              t: 'C. Huỳnh', r: '2.10' },
          { s: 'TViệt (Tập viết)',     t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán',                 t: 'C. Huỳnh', r: '2.10' },
          { s: 'Mĩ thuật',             t: 'C. Thủy',  r: 'Phòng MT', x: true },
          { s: 'Toán',                 t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'TViệt (Đọc)',          t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán',                 t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Anh',            t: 'C. Uyên',  r: 'Phòng AV', x: true },
          { s: 'TViệt (Nói – Nghe)',   t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán TC',              t: 'C. Loan',  r: 'VH khối 2', x: true }
        ],
        [
          { s: 'TViệt (Đọc)',          t: 'C. Huỳnh', r: '2.10' },
          { s: 'TNXH',                 t: 'C. Huỳnh', r: '2.10' },
          { s: 'TViệt (Nghe viết)',    t: 'C. Huỳnh', r: '2.10' },
          { s: 'TNXH',                 t: 'C. Huỳnh', r: '2.10' },
          { s: 'TViệt (ĐMR)',          t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'CDS-AI',               t: 'C. Ngọc',  r: 'VH',        x: true },
          { s: 'Tiếng Anh',            t: 'C. Uyên',  r: 'Phòng AV',  x: true },
          { s: 'Đạo đức',              t: 'C. Loan',  r: 'VH khối 2', x: true },
          { s: 'GDTC (TC)',            t: 'Th. Viên', r: 'Sân GDTC',  x: true },
          { s: 'Âm nhạc (TC)',         t: 'C. Ngọc',  r: 'Phòng AN',  x: true }
        ]
      ]
    },
    {
      key: 'afternoon',
      label: 'Buổi chiều',
      icon: '🌙',
      rows: [
        [
          { s: 'GDTC',                 t: 'Th. Viên', r: 'Sân GDTC', x: true },
          { s: 'TViệt (Đọc)',          t: 'C. Huỳnh', r: '2.10' },
          { s: 'HĐTN',                 t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán',                 t: 'C. Huỳnh', r: '2.10' },
          { s: 'TViệt (TC2)',          t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'GDTC',                 t: 'Th. Viên', r: 'Sân GDTC', x: true },
          { s: 'TViệt (Đọc)',          t: 'C. Huỳnh', r: '2.10' },
          { s: 'TViệt (LTVC)',         t: 'C. Huỳnh', r: '2.10' },
          { s: 'TViệt (LVĐ)',          t: 'C. Huỳnh', r: '2.10' },
          { s: 'SHL',                  t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'Âm nhạc',              t: 'C. Ngọc',  r: 'Phòng AN', x: true },
          { s: 'Toán',                 t: 'C. Huỳnh', r: '2.10' },
          null,
          { s: 'TViệt (TC1)',          t: 'C. Huỳnh', r: '2.10' },
          null
        ]
      ]
    }
  ],

  glossary: [
    ['TViệt',   'Tiếng Việt'],
    ['ĐMR',     'Đọc mở rộng'],
    ['LTVC',    'Luyện từ và câu'],
    ['LVĐ',     'Luyện viết đoạn'],
    ['TNXH',    'Tự nhiên và Xã hội'],
    ['HĐTN',    'Hoạt động trải nghiệm'],
    ['GDTC',    'Giáo dục thể chất'],
    ['SHL',     'Sinh hoạt lớp'],
    ['TC',      'Tiết tăng cường'],
    ['CDS-AI',  'Công dân số – AI'],
    ['VH',      'Phòng văn hoá'],
    ['AV / AN / MT', 'Phòng Anh văn / Âm nhạc / Mĩ thuật']
  ]
};

/* ------------------------- render ------------------------- */

function el(tag, cls, text){
  const n = document.createElement(tag);
  if (cls)  n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function cellContent(cell){
  const wrap = el('div', 'tt-cell' + (cell.x ? ' is-special' : ''));
  wrap.appendChild(el('span', 'tt-subject', cell.s));
  const meta = el('span', 'tt-meta');
  meta.textContent = cell.r ? cell.t + ' · ' + cell.r : cell.t;
  wrap.appendChild(meta);
  return wrap;
}

function todayIndex(){
  const d = new Date().getDay();
  return TIMETABLE.days.findIndex(x => x.jsDay === d);
}

function buildTable(session, todayIdx){
  const wrap = el('div', 'tt-table-wrap');
  const table = el('table', 'tt-table');

  const thead = el('thead');
  const hr = el('tr');
  hr.appendChild(el('th', 'tt-corner', 'Tiết'));
  TIMETABLE.days.forEach((d, i) => {
    const th = el('th', i === todayIdx ? 'is-today' : null, d.label);
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = el('tbody');
  session.rows.forEach((row, ri) => {
    const tr = el('tr');
    tr.appendChild(el('th', 'tt-period', String(ri + 1)));
    row.forEach((cell, ci) => {
      const td = el('td', ci === todayIdx ? 'is-today' : null);
      if (cell) td.appendChild(cellContent(cell));
      else { td.classList.add('tt-empty'); td.textContent = '—'; }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  wrap.appendChild(table);
  return wrap;
}

function buildDayCards(todayIdx){
  const grid = el('div', 'tt-day-grid');

  TIMETABLE.days.forEach((day, di) => {
    const card = el('article', 'tt-day-card' + (di === todayIdx ? ' is-today' : ''));
    const head = el('header', 'tt-day-head');
    head.appendChild(el('h3', null, day.label));
    if (di === todayIdx) head.appendChild(el('span', 'tt-today-flag', 'Hôm nay'));
    card.appendChild(head);

    TIMETABLE.sessions.forEach(session => {
      const lessons = session.rows.map((row, ri) => ({ cell: row[di], period: ri + 1 }))
                                  .filter(item => item.cell);
      if (!lessons.length) return;

      card.appendChild(el('p', 'tt-day-session', session.icon + ' ' + session.label));
      const list = el('ol', 'tt-day-list');
      lessons.forEach(({ cell, period }) => {
        const li = el('li', cell.x ? 'is-special' : null);
        li.appendChild(el('span', 'tt-day-period', 'Tiết ' + period));
        const body = el('div', 'tt-day-body');
        body.appendChild(el('span', 'tt-subject', cell.s));
        body.appendChild(el('span', 'tt-meta', cell.r ? cell.t + ' · ' + cell.r : cell.t));
        li.appendChild(body);
        list.appendChild(li);
      });
      card.appendChild(list);
    });

    grid.appendChild(card);
  });

  return grid;
}

function buildGlossary(){
  const dl = el('dl', 'tt-glossary');
  TIMETABLE.glossary.forEach(([abbr, full]) => {
    const item = el('div', 'tt-gloss-item');
    item.appendChild(el('dt', null, abbr));
    item.appendChild(el('dd', null, full));
    dl.appendChild(item);
  });
  return dl;
}

document.addEventListener('DOMContentLoaded', () => {
  const todayIdx = todayIndex();

  const metaHost = document.getElementById('tt-meta');
  if (metaHost){
    metaHost.innerHTML = '';
    [
      ['Trường',   TIMETABLE.school],
      ['Lớp',      TIMETABLE.className],
      ['GVCN',     TIMETABLE.teacher],
      ['Áp dụng',  TIMETABLE.effectiveFrom.replace('Thực hiện từ ngày ', 'từ ')]
    ].forEach(([k, v]) => {
      const item = el('div', 'tt-meta-item');
      item.appendChild(el('span', 'tt-meta-key', k));
      item.appendChild(el('span', 'tt-meta-val', v));
      metaHost.appendChild(item);
    });
  }

  const tableHost = document.getElementById('tt-tables');
  if (tableHost){
    tableHost.innerHTML = '';
    TIMETABLE.sessions.forEach(session => {
      const block = el('section', 'tt-session');
      const h = el('h2', 'tt-session-title');
      h.appendChild(el('span', 'tt-session-icon', session.icon));
      h.appendChild(document.createTextNode(' ' + session.label));
      block.appendChild(h);
      block.appendChild(el('p', 'tt-scroll-hint', '← vuốt ngang để xem đủ 5 ngày →'));
      block.appendChild(buildTable(session, todayIdx));
      tableHost.appendChild(block);
    });
  }

  const dayHost = document.getElementById('tt-days');
  if (dayHost){
    dayHost.innerHTML = '';
    dayHost.appendChild(buildDayCards(todayIdx));
  }

  const glossHost = document.getElementById('tt-glossary');
  if (glossHost){
    glossHost.innerHTML = '';
    glossHost.appendChild(buildGlossary());
  }

  const printBtn = document.getElementById('tt-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
});
