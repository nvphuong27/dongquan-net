/* =========================================================
   Thời khoá biểu — Lớp 2/10, TH Trần Nhân Tông
   Sửa dữ liệu ở object TIMETABLE bên dưới là trang tự cập nhật.
   ========================================================= */

const TIMETABLE = {
  school:   'TH Trần Nhân Tông',
  schoolYear: 'Năm học 2026 – 2027 · Học kỳ 1',
  className: 'Lớp 2/10',
  teacher:  'Nguyễn Thị Như Huỳnh',
  effectiveFrom: 'Thực hiện từ ngày 21/09/2026',

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
      time: '7h15 – 10h25',
      rows: [
        [
          { s: 'Chào cờ',                  t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Việt (Nói – nghe)',  t: 'C. Huỳnh', r: '2.10' },
          { s: 'Âm nhạc (TC)',             t: 'C. Ngọc',  r: 'Phòng AN',    x: true },
          { s: 'Mĩ thuật',                 t: 'C. Thủy',  r: 'Phòng MT',    x: true },
          { s: 'Toán',                     t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'Toán',                     t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Việt (Tập viết)',    t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Anh',                t: 'C. Uyên',  r: 'Phòng AV',    x: true },
          { s: 'Tiếng Việt (LTVC)',        t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán (TC)',                t: 'C. Loan',  r: 'VH khối 2',   x: true }
        ],
        [
          { s: 'Tiếng Việt (Đọc)',         t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán',                     t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán',                     t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tự nhiên và Xã hội',       t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Việt (LVĐ)',         t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'Tiếng Việt (Đọc)',         t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Anh',                t: 'C. Uyên',  r: 'Phòng AV',    x: true },
          { s: 'Đạo đức',                  t: 'C. Loan',  r: 'VH khối 2',   x: true },
          { s: 'Thể dục',                  t: 'Th. Viên', r: 'Sân thể dục', x: true },
          { s: 'Tiếng Việt (ĐMR)',         t: 'C. Huỳnh', r: '2.10' }
        ]
      ]
    },
    {
      key: 'afternoon',
      label: 'Buổi chiều',
      icon: '🌙',
      time: '13h45 – 16h15',
      timeByDay: { wed: '13h45 – 15h50', fri: '13h45 – 15h50' }, // thứ 4 & thứ 6 tan sớm
      rows: [
        [
          { s: 'Thể dục',                  t: 'Th. Viên', r: 'Sân thể dục', x: true },
          { s: 'Tiếng Việt (Đọc)',         t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Việt (Nghe – viết)', t: 'C. Huỳnh', r: '2.10' },
          { s: 'Toán',                     t: 'C. Huỳnh', r: '2.10' },
          { s: 'Tiếng Việt (TC2)',         t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'Thể dục',                  t: 'Th. Viên', r: 'Sân thể dục', x: true },
          { s: 'Tiếng Việt (Đọc)',         t: 'C. Huỳnh', r: '2.10' },
          { s: 'Công dân số – AI',         t: 'C. Ngọc',  r: 'VH',          x: true },
          { s: 'Tiếng Việt (TC1)',         t: 'C. Huỳnh', r: '2.10' },
          { s: 'Sinh hoạt lớp',            t: 'C. Huỳnh', r: '2.10' }
        ],
        [
          { s: 'Âm nhạc',                  t: 'C. Ngọc',  r: 'Phòng AN',    x: true },
          { s: 'Tự nhiên và Xã hội',       t: 'C. Huỳnh', r: '2.10' },
          null,
          { s: 'Hoạt động trải nghiệm',    t: 'C. Huỳnh', r: '2.10' },
          null
        ]
      ]
    }
  ],

  glossary: [
    ['ĐMR',          'Đọc mở rộng'],
    ['LTVC',         'Luyện từ và câu'],
    ['LVĐ',          'Luyện viết đoạn'],
    ['TC',           'Tiết tăng cường'],
    ['TC1 / TC2',    'Tiết tăng cường 1 / 2'],
    ['VH',           'Phòng văn hoá'],
    ['AV / AN / MT', 'Phòng Anh văn / Âm nhạc / Mĩ thuật']
  ]};

/* ------------------------- render ------------------------- */

function el(tag, cls, text){
  const n = document.createElement(tag);
  if (cls)  n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function todayIndex(){
  const d = new Date().getDay();
  return TIMETABLE.days.findIndex(x => x.jsDay === d);
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

      const time = (session.timeByDay && session.timeByDay[day.key]) || session.time;
      const sessionHead = el('p', 'tt-day-session', session.icon + ' ' + session.label);
      if (time) sessionHead.appendChild(el('span', 'tt-session-time', time));
      card.appendChild(sessionHead);
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
