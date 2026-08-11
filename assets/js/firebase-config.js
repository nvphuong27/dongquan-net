// ==============================================================
// CẤU HÌNH FIREBASE — BẠN CẦN ĐIỀN CONFIG THẬT VÀO ĐÂY
// ==============================================================
// Cách lấy config:
// 1. Vào https://console.firebase.google.com → chọn project của bạn
//    (hoặc bấm "Add project" để tạo mới, miễn phí).
// 2. Vào Project settings (icon bánh răng) → General → Your apps
//    → bấm icon "</>" (Web) → đăng ký app (tên tuỳ ý, ví dụ "dongquan-net")
//    → Firebase sẽ hiện ra 1 đoạn config giống như export bên dưới.
// 3. Copy đúng object đó, dán thay vào firebaseConfig ở dưới.
// 4. Vào Firestore Database (menu bên trái) → Create database →
//    chọn location gần Việt Nam (asia-southeast1) → start.
// 5. Vào tab Rules của Firestore, dán rule sau rồi Publish
//    (rule này cho phép đọc/ghi công khai — vì site không có đăng nhập):
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /kmh_weeks/{weekId} {
//          allow read, write: if true;
//        }
//      }
//    }
//
// Config này là "public config" phía client (không phải secret key),
// Firebase cho phép để trong code frontend công khai như thế này.
// ==============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyCX8LTnet0OnEPmCpoq2Ea06awj1pENkgA",
  authDomain: "dongquan-net-9e319.firebaseapp.com",
  projectId: "dongquan-net-9e319",
  storageBucket: "dongquan-net-9e319.firebasestorage.app",
  messagingSenderId: "934427289735",
  appId: "1:934427289735:web:2e68f4c93204bc7b6bf022"
};
