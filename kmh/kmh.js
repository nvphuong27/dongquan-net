// Module Bài tập KMH — đồng bộ qua Firebase Firestore
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
const assignmentInput = document.getElementById('assignment-input');
const submissionInput = document.getElementById('submission-input');
const assignmentPreview = document.getElementById('assignment-preview');
const submissionPreview = document.getElementById('submission-preview');
const saveAssignmentBtn = document.getElementById('save-assignment-btn');
const saveSubmissionBtn = document.getElementById('save-submission-btn');

let currentWeekId = null;
let weeksData = {}; // cache tất cả tuần theo id

function computeStatus(w){
  if (w.submissionLink) return 'finish';
  if (w.assignmentLink) return 'pending';
  return 'empty';
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
    const status = computeStatus(w);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'week-card';
    card.innerHTML = `
      <span class="week-num">TUẦN ${String(w.week).padStart(2,'0')}</span>
      <span class="week-title">${escapeHtml(w.title || ('Tuần ' + w.week))}</span>
      ${stampHtml(status)}
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
  modalStatusBadge.innerHTML = stampHtml(computeStatus(w));
  assignmentInput.value = w.assignmentLink || '';
  submissionInput.value = w.submissionLink || '';
  updatePreview(assignmentPreview, w.assignmentLink);
  updatePreview(submissionPreview, w.submissionLink);
  modal.classList.add('open');
}

function updatePreview(el, link){
  el.innerHTML = link ? `Đang lưu: <a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(link)}</a>` : '';
}

function closeModal(){
  modal.classList.remove('open');
  currentWeekId = null;
}

modalCloseBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

saveAssignmentBtn.addEventListener('click', async () => {
  if (!currentWeekId) return;
  const link = assignmentInput.value.trim();
  await updateDoc(doc(db, 'kmh_weeks', currentWeekId), { assignmentLink: link });
  updatePreview(assignmentPreview, link);
});

saveSubmissionBtn.addEventListener('click', async () => {
  if (!currentWeekId) return;
  const link = submissionInput.value.trim();
  await updateDoc(doc(db, 'kmh_weeks', currentWeekId), { submissionLink: link });
  updatePreview(submissionPreview, link);
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
    assignmentLink: '',
    submissionLink: ''
  });
});

// Realtime listener — tự cập nhật khi có thay đổi từ bất kỳ thiết bị nào
const q = query(weeksCol, orderBy('week', 'asc'));
onSnapshot(q, (snapshot) => {
  weeksData = {};
  snapshot.forEach(docSnap => {
    weeksData[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
  });
  renderGrid();
  syncStatus.textContent = snapshot.empty
    ? 'Chưa có tuần nào — bấm "Thêm tuần mới" để bắt đầu.'
    : `Đã đồng bộ — ${snapshot.size} tuần.`;

  // Nếu modal đang mở đúng tuần này, cập nhật badge theo dữ liệu mới nhất
  if (currentWeekId && weeksData[currentWeekId]) {
    modalStatusBadge.innerHTML = stampHtml(computeStatus(weeksData[currentWeekId]));
  }
}, (err) => {
  console.error(err);
  syncStatus.textContent = '⚠️ Không kết nối được Firebase. Kiểm tra lại firebase-config.js và Firestore Rules.';
});
