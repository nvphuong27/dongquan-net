// ==============================================================
// CẤU HÌNH ĐĂNG NHẬP MICROSOFT (OneDrive) — BẠN CẦN ĐIỀN CLIENT ID VÀO ĐÂY
// ==============================================================
// Mục đích: cho phép trang này tải file đính kèm (ảnh bài tập, ảnh/video
// bài đã làm) trực tiếp lên MỘT folder riêng trong OneDrive của bạn.
//
// An toàn ra sao: Client ID dưới đây KHÔNG phải mật khẩu hay secret —
// nó chỉ là "tên" của app (tương tự apiKey của Firebase ở file cạnh bên),
// lộ ra cũng không dùng để đăng nhập thay bạn được.
// Quyền mà app xin — Files.ReadWrite.AppFolder — là quyền đặc biệt của
// Microsoft Graph: nó CHỈ cho phép đọc/ghi trong đúng 1 folder ẩn mà
// Microsoft tự tạo riêng cho app này (OneDrive > Apps > <tên app>).
// App không có cách nào nhìn thấy hay đụng tới phần còn lại trong
// OneDrive 1TB của bạn — kể cả nếu ai đó lấy được access token.
//
// CÁCH LẤY CLIENT ID (làm 1 lần, khoảng 5 phút):
// 1. Vào https://portal.azure.com — đăng nhập bằng chính tài khoản
//    Microsoft gia đình (tài khoản có OneDrive 1TB) của bạn.
// 2. Tìm "App registrations" → bấm "+ New registration".
// 3. Đặt tên tuỳ ý, ví dụ "dongquan-net-kmh".
// 4. Ở "Supported account types" — chọn đúng:
//      "Personal Microsoft accounts only"
// 5. Ở "Redirect URI" — chọn platform "Single-page application (SPA)",
//    điền URL trang này, ví dụ:
//      https://dongquan.net/kmh/
//    (nếu bạn cũng mở trang bằng local server để test, bấm "+ Add URI"
//    thêm cả URL đó, ví dụ http://localhost:5500/kmh/).
// 6. Bấm "Register". Ở trang app vừa tạo, copy giá trị
//      "Application (client) ID"
//    rồi dán thay vào CLIENT_ID bên dưới.
// 7. Vào "API permissions" (menu bên trái) → "+ Add a permission" →
//    "Microsoft Graph" → "Delegated permissions" → gõ tìm và chọn:
//      Files.ReadWrite.AppFolder
//    → bấm "Add permissions". (Không cần "Grant admin consent" —
//    tài khoản cá nhân không có bước này.)
// 8. Xong. Không cần tạo Client secret, không cần server riêng.
// ==============================================================

const CLIENT_ID = "DÁN-APPLICATION-CLIENT-ID-CỦA-BẠN-VÀO-ĐÂY";

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: "https://login.microsoftonline.com/consumers",
    redirectUri: window.location.origin + window.location.pathname.replace(/index\.html$/, '')
  },
  cache: {
    cacheLocation: "localStorage"
  }
};

export const ONEDRIVE_SCOPES = ["Files.ReadWrite.AppFolder"];

export function isOneDriveConfigured(){
  return !!CLIENT_ID && !CLIENT_ID.startsWith("DÁN-");
}
