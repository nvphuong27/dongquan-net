// Module Bài tập KMH — đồng bộ qua Firebase Firestore
// Mỗi tuần có nhiều "bài tập" (items): link cô giáo gửi, link bài đã làm, link đính kèm.
import { firebaseConfig } from '/assets/js/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, collection, doc, setDoc, updateDoc,
  onSnapshot, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const weeksCol = collection(db, 'kmh_weeks');

const grid = document.getElementById('week-grid');
const addBtn = document.getElementById('add-week-btn');
const syncStatus = document.getElementById('sync-status');

const modal = document.getElementById('week-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalWeekLabel = document.getElementById('modal-week-label');
const modalWeekTitle = document.getElementById('modal-week-title');
const modalStatusBadge = document.getElementById('modal-status-badge');
const itemsTbody = document.getElementById('items-tbody');
const addItemBtn = document.getElementById('add-item-btn');

let currentWeekId = null;
let weeksData = {}; // cache tất cả tuần theo id, đã được chuẩn hoá (normalize)

function newId(){
  return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2);
}

// Chuyển dữ liệu tuần cũ (1 link bài tập + 1 link bài nộp) sang model "nhiều bài tập"
function normalizeWeek(raw){
  if (Array.isArray(raw.items)){
    return { ...raw, items: raw.items };
  }
  const hasLegacyLink = raw.assignmentLink || raw.submissionLink;
  const legacyItem = {
    id: newId(),
    link: raw.assignmentLink || '',
    submissionLink: raw.submissionLink || '',
    attachmentLink: ''
  };
  return { ...raw, items: hasLegacyLink ? [legacyItem] : [] };
}

function computeItemStatus(item){
  if (item.submissionLink) return 'finish';
  if (item.link) return 'pending';
  return 'empty';
}

function computeWeekStatus(items){
  if (!items || !items.length) return 'empty';
  const statuses = items.map(computeItemStatus);
  if (statuses.every(s => s === 'finish')) return 'finish';
  if (statuses.some(s => s !== 'empty')) return 'pending';
  return 'empty';
}

function weekProgressText(items){
  if (!items || !items.length) return '';
  const done = items.filter(it => computeItemStatus(it) === 'finish').length;
  return `${done}/${items.length} hoàn thành`;
}

function stampHtml(status){
  if (status === 'finish') return `<span class="stamp finish">✔ Finish</span>`;
  if (status === 'pending') return `<span class="stamp pending">● Pending</span>`;
  return `<span class="stamp empty">Chưa có bài</span>`;
}

function renderGrid(){
  // Xoá hết card tuần cũ (giữ lại nút "+")
  [...grid.querySelectorAll('.week-card:not(.add-card)')].forEach(el => el.remove());

  const sorted = Object.values(weeksData).sort((a,b) => a.week - b.week);

  sorted.forEach(w => {
    const status = computeWeekStatus(w.items);
    const progress = weekProgressText(w.items);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'week-card';
    card.innerHTML = `
      <span class="week-num">TUẦN ${String(w.week).padStart(2,'0')}</span>
      <span class="week-title">${escapeHtml(w.title || ('Tuần ' + w.week))}</span>
      ${stampHtml(status)}
      ${progress ? `<span class="week-progress">${progress}</span>` : ''}
    `;
    card.addEventListener('click', () => openModal(w.id));
    grid.insertBefore(card, addBtn);
  });
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function openModal(weekId){
  const w = weeksData[weekId];
  if (!w) return;
  currentWeekId = weekId;
  modalWeekLabel.textContent = `Tuần ${w.week}`;
  modalWeekTitle.textContent = w.title || `Tuần ${w.week}`;
  modalStatusBadge.innerHTML = stampHtml(computeWeekStatus(w.items));
  renderItemsTable(w.items);
  modal.classList.add('open');
}

function closeModal(){
  modal.classList.remove('open');
  currentWeekId = null;
}

modalCloseBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

function syncOpenLink(a, value){
  const v = (value || '').trim();
  if (v) {
    a.href = v;
    a.classList.remove('disabled');
    a.removeAttribute('tabindex');
  } else {
    a.removeAttribute('href');
    a.classList.add('disabled');
    a.tabIndex = -1;
  }
}

function buildLinkCell(value, placeholder){
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'link-cell';

  const input = document.createElement('input');
  input.type = 'url';
  input.placeholder = placeholder;
  input.value = value || '';

  const openLink = document.createElement('a');
  openLink.className = 'open-link';
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.title = 'Mở link';
  openLink.textContent = '↗';
  syncOpenLink(openLink, value);

  input.addEventListener('input', () => syncOpenLink(openLink, input.value));

  wrap.append(input, openLink);
  td.appendChild(wrap);
  return { td, input, openLink };
}

function renderItemsTable(items){
  itemsTbody.innerHTML = '';
  items.forEach(item => itemsTbody.appendChild(buildItemRow(item)));
}

function buildItemRow(item){
  const tr = document.createElement('tr');
  tr.dataset.id = item.id;

  const { td: linkTd, input: linkInput } = buildLinkCell(item.link, 'https://...');
  const statusTd = document.createElement('td');
  statusTd.className = 'cell-status';
  statusTd.innerHTML = stampHtml(computeItemStatus(item));

  const { td: subTd, input: subInput } = buildLinkCell(item.submissionLink, 'https://...');
  const { td: attTd, input: attInput } = buildLinkCell(item.attachmentLink, 'Link Drive/Photos');

  const delTd = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'row-del-btn';
  delBtn.title = 'Xoá dòng';
  delBtn.textContent = '🗑';
  delTd.appendChild(delBtn);

  tr.append(linkTd, statusTd, subTd, attTd, delTd);

  const commit = () => saveItemFields(item.id, {
    link: linkInput.value.trim(),
    submissionLink: subInput.value.trim(),
    attachmentLink: attInput.value.trim()
  }, statusTd);

  linkInput.addEventListener('change', commit);
  subInput.addEventListener('change', commit);
  attInput.addEventListener('change', commit);
  delBtn.addEventListener('click', () => deleteItem(item.id));

  return tr;
}

async function saveItemFields(itemId, patch, statusTdEl){
  const w = weeksData[currentWeekId];
  if (!w) return;
  const items = w.items.map(it => it.id === itemId ? { ...it, ...patch } : it);
  w.items = items;
  const updated = items.find(it => it.id === itemId);
  if (statusTdEl) statusTdEl.innerHTML = stampHtml(computeItemStatus(updated));
  modalStatusBadge.innerHTML = stampHtml(computeWeekStatus(items));
  await updateDoc(doc(db, 'kmh_weeks', currentWeekId), { items });
}

async function deleteItem(itemId){
  const w = weeksData[currentWeekId];
  if (!w) return;
  if (!window.confirm('Xoá dòng bài tập này?')) return;
  const items = w.items.filter(it => it.id !== itemId);
  w.items = items;
  renderItemsTable(items);
  modalStatusBadge.innerHTML = stampHtml(computeWeekStatus(items));
  await updateDoc(doc(db, 'kmh_weeks', currentWeekId), { items });
}

addItemBtn.addEventListener('click', async () => {
  const w = weeksData[currentWeekId];
  if (!w) return;
  const item = { id: newId(), link: '', submissionLink: '', attachmentLink: '' };
  const items = [...w.items, item];
  w.items = items;
  itemsTbody.appendChild(buildItemRow(item));
  modalStatusBadge.innerHTML = stampHtml(computeWeekStatus(items));
  await updateDoc(doc(db, 'kmh_weeks', currentWeekId), { items });
});

addBtn.addEventListener('click', async () => {
  const nums = Object.values(weeksData).map(w => w.week);
  const nextWeek = nums.length ? Math.max(...nums) + 1 : 1;
  const title = window.prompt(`Tên hiển thị cho Tuần ${nextWeek} (có thể để trống):`, `Tuần ${nextWeek}`);
  if (title === null) return; // bấm Cancel
  const id = String(nextWeek);
  await setDoc(doc(db, 'kmh_weeks', id), {
    week: nextWeek,
    title: title || `Tuần ${nextWeek}`,
    items: []
  });
});

// Realtime listener — tự cập nhật khi có thay đổi từ bất kỳ thiết bị nào
const q = query(weeksCol, orderBy('week', 'asc'));
onSnapshot(q, (snapshot) => {
  weeksData = {};
  snapshot.forEach(docSnap => {
    const raw = { id: docSnap.id, ...docSnap.data() };
    weeksData[docSnap.id] = normalizeWeek(raw);
  });
  renderGrid();
  syncStatus.textContent = snapshot.empty
    ? 'Chưa có tuần nào — bấm "Thêm tuần mới" để bắt đầu.'
    : `Đã đồng bộ — ${snapshot.size} tuần.`;

  // Nếu modal đang mở đúng tuần này, chỉ cập nhật badge tổng — không render lại bảng
  // để tránh mất nội dung người dùng đang gõ giữa các dòng khác.
  if (currentWeekId && weeksData[currentWeekId]) {
    modalStatusBadge.innerHTML = stampHtml(computeWeekStatus(weeksData[currentWeekId].items));
  }
}, (err) => {
  console.error(err);
  syncStatus.textContent = '⚠️ Không kết nối được Firebase. Kiểm tra lại firebase-config.js và Firestore Rules.';
});
