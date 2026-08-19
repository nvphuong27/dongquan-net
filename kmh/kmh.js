// Module Bài tập KMH — đồng bộ qua Firebase Firestore
// Mỗi tuần có nhiều "bài tập" (items): link cô giáo gửi, link bài đã làm, link đính kèm.
import { firebaseConfig } from '/assets/js/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, collection, doc, setDoc, updateDoc,
  onSnapshot, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { msalConfig, ONEDRIVE_SCOPES, isOneDriveConfigured } from '/assets/js/onedrive-config.js';
import { PublicClientApplication } from 'https://esm.sh/@azure/msal-browser@3.30.0';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const weeksCol = collection(db, 'kmh_weeks');

// ---------------- OneDrive (đính kèm file, giới hạn 1 folder riêng) ----------------
const ONEDRIVE_CONFIGURED = isOneDriveConfigured();
const GRAPH_APPFOLDER = 'https://graph.microsoft.com/v1.0/me/drive/special/approot';
let msalInstance = null;
let msalAccount = null;

async function initMsal(){
  if (!ONEDRIVE_CONFIGURED) return;
  msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();
  const redirectResult = await msalInstance.handleRedirectPromise().catch(() => null);
  msalAccount = redirectResult?.account || msalInstance.getAllAccounts()[0] || null;
}
const msalReady = initMsal();

async function getGraphToken(){
  if (!ONEDRIVE_CONFIGURED) throw new Error('Chưa cấu hình OneDrive — xem assets/js/onedrive-config.js');
  await msalReady;
  if (!msalAccount) {
    const loginResult = await msalInstance.loginPopup({ scopes: ONEDRIVE_SCOPES });
    msalAccount = loginResult.account;
  }
  try {
    const result = await msalInstance.acquireTokenSilent({ scopes: ONEDRIVE_SCOPES, account: msalAccount });
    return result.accessToken;
  } catch (err) {
    const result = await msalInstance.acquireTokenPopup({ scopes: ONEDRIVE_SCOPES, account: msalAccount });
    msalAccount = result.account;
    return result.accessToken;
  }
}

function sanitizeFileName(name){
  return (name || 'file').replace(/[\\/:*?"<>|#%]/g, '_');
}

// Upload file vào folder riêng của app trên OneDrive (không đụng tới chỗ khác).
async function uploadFileToOneDrive(file){
  const token = await getGraphToken();
  const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const path = `${GRAPH_APPFOLDER}:/${encodeURIComponent(safeName)}:`;

  if (file.size <= 4 * 1024 * 1024) {
    const res = await fetch(`${path}/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });
    if (!res.ok) throw new Error(`Tải lên thất bại (${res.status})`);
    const item = await res.json();
    return item.webUrl;
  }

  // File lớn hơn 4MB: dùng upload session, chia thành từng đoạn 5MB.
  const sessionRes = await fetch(`${path}/createUploadSession`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'rename' } })
  });
  if (!sessionRes.ok) throw new Error(`Không tạo được upload session (${sessionRes.status})`);
  const { uploadUrl } = await sessionRes.json();

  const chunkSize = 5 * 1024 * 1024;
  let start = 0;
  let lastItem = null;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunkRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': String(end - start),
        'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
      },
      body: file.slice(start, end)
    });
    if (!chunkRes.ok) throw new Error(`Tải lên thất bại ở đoạn ${start}-${end} (${chunkRes.status})`);
    if (end === file.size) lastItem = await chunkRes.json();
    start = end;
  }
  return lastItem?.webUrl;
}

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

// Chuyển 1 item cũ (1 ô "Đính kèm" chung) sang model 2 ô đính kèm riêng (bài tập / bài làm).
// Đính kèm cũ được giữ lại ở ô "bài làm" vì đó là nơi hay dùng để nộp ảnh minh chứng.
function normalizeItem(it){
  if (it.assignmentAttachmentLink !== undefined || it.submissionAttachmentLink !== undefined) {
    return {
      ...it,
      assignmentAttachmentLink: it.assignmentAttachmentLink || '',
      submissionAttachmentLink: it.submissionAttachmentLink || ''
    };
  }
  return {
    ...it,
    assignmentAttachmentLink: '',
    submissionAttachmentLink: it.attachmentLink || ''
  };
}

// Chuyển dữ liệu tuần cũ (1 link bài tập + 1 link bài nộp) sang model "nhiều bài tập"
function normalizeWeek(raw){
  if (Array.isArray(raw.items)){
    return { ...raw, items: raw.items.map(normalizeItem) };
  }
  const hasLegacyLink = raw.assignmentLink || raw.submissionLink;
  const legacyItem = normalizeItem({
    id: newId(),
    link: raw.assignmentLink || '',
    submissionLink: raw.submissionLink || ''
  });
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

// 1 ô đính kèm: nhãn (BT/BL) + input link + nút mở + nút tải file lên OneDrive.
function buildAttachRow(tag, value){
  const wrapper = document.createElement('div');
  wrapper.className = 'attach-block';

  const row = document.createElement('div');
  row.className = 'attach-row';

  const tagEl = document.createElement('span');
  tagEl.className = 'attach-tag';
  tagEl.textContent = tag;

  const input = document.createElement('input');
  input.type = 'url';
  input.className = 'attach-link';
  input.placeholder = 'Chưa có file';
  input.value = value || '';

  const openLink = document.createElement('a');
  openLink.className = 'attach-open';
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.title = 'Mở file';
  openLink.textContent = '↗';
  syncOpenLink(openLink, value);

  const uploadBtn = document.createElement('button');
  uploadBtn.type = 'button';
  uploadBtn.className = 'attach-upload';
  uploadBtn.title = 'Tải file lên OneDrive';
  uploadBtn.textContent = '📎';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.hidden = true;

  const errEl = document.createElement('p');
  errEl.className = 'attach-error';
  errEl.hidden = true;

  input.addEventListener('input', () => syncOpenLink(openLink, input.value));

  uploadBtn.addEventListener('click', () => {
    errEl.hidden = true;
    if (!ONEDRIVE_CONFIGURED){
      errEl.textContent = 'Chưa cấu hình OneDrive — xem assets/js/onedrive-config.js';
      errEl.hidden = false;
      return;
    }
    fileInput.click();
  });

  row.append(tagEl, input, openLink, uploadBtn, fileInput);
  wrapper.append(row, errEl);

  return { wrapper, input, openLink, uploadBtn, fileInput, errEl };
}

function wireAttachUpload({ input, openLink, uploadBtn, fileInput, errEl }, onUploaded){
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    errEl.hidden = true;
    uploadBtn.disabled = true;
    const prevLabel = uploadBtn.textContent;
    uploadBtn.textContent = '…';
    try {
      const webUrl = await uploadFileToOneDrive(file);
      input.value = webUrl;
      syncOpenLink(openLink, webUrl);
      onUploaded();
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Tải lên lỗi: ' + (err.message || err);
      errEl.hidden = false;
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = prevLabel;
    }
  });
}

function buildAttachCell(item){
  const td = document.createElement('td');
  td.className = 'cell-attach';
  const bt = buildAttachRow('BT', item.assignmentAttachmentLink);
  const bl = buildAttachRow('BL', item.submissionAttachmentLink);
  td.append(bt.wrapper, bl.wrapper);
  return {
    td,
    assignmentInput: bt.input,
    submissionInput: bl.input,
    wireUploads(commit){
      wireAttachUpload(bt, commit);
      wireAttachUpload(bl, commit);
    }
  };
}

function buildItemRow(item){
  const tr = document.createElement('tr');
  tr.dataset.id = item.id;

  const { td: linkTd, input: linkInput } = buildLinkCell(item.link, 'https://...');
  const statusTd = document.createElement('td');
  statusTd.className = 'cell-status';
  statusTd.innerHTML = stampHtml(computeItemStatus(item));

  const { td: subTd, input: subInput } = buildLinkCell(item.submissionLink, 'https://...');
  const attCell = buildAttachCell(item);

  const delTd = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'row-del-btn';
  delBtn.title = 'Xoá dòng';
  delBtn.textContent = '🗑';
  delTd.appendChild(delBtn);

  tr.append(linkTd, statusTd, subTd, attCell.td, delTd);

  const commit = () => saveItemFields(item.id, {
    link: linkInput.value.trim(),
    submissionLink: subInput.value.trim(),
    assignmentAttachmentLink: attCell.assignmentInput.value.trim(),
    submissionAttachmentLink: attCell.submissionInput.value.trim()
  }, statusTd);

  linkInput.addEventListener('change', commit);
  subInput.addEventListener('change', commit);
  attCell.assignmentInput.addEventListener('change', commit);
  attCell.submissionInput.addEventListener('change', commit);
  attCell.wireUploads(commit);
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
  const item = { id: newId(), link: '', submissionLink: '', assignmentAttachmentLink: '', submissionAttachmentLink: '' };
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
