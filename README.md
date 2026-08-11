# dongquan.net

Website học tiếng Anh & blog cá nhân của **Nguyễn Viết Đông Quân**.

Site tĩnh (HTML/CSS/JS thuần), host trên **GitHub Pages**, domain `dongquan.net` quản lý qua **Cloudflare** (đã cấu hình DNS — record A + CNAME xong).

## Việc cần làm để chạy được toàn bộ (checklist)

### 1. Đưa code lên GitHub
```bash
# Trong thư mục dongquan-net này:
git init
git add .
git commit -m "Init dongquan.net"
git branch -M main
git remote add origin https://github.com/nvphuong27/dongquan-net.git
git push -u origin main
```

### 2. Bật GitHub Pages
- Vào repo trên GitHub → **Settings → Pages**
- Source: chọn branch `main`, folder `/ (root)`
- Chờ vài phút, GitHub sẽ tự nhận diện file `CNAME` (đã có sẵn, chứa `dongquan.net`)
- Sau khi DNS check thành công → tick **Enforce HTTPS**

### 3. Setup Firebase (bắt buộc để module "Bài tập KMH" hoạt động)
1. Vào https://console.firebase.google.com → tạo project mới (miễn phí)
2. Bật **Firestore Database** (chọn location `asia-southeast1` cho gần VN)
3. Vào **Project settings → General → Your apps** → thêm Web app → copy config
4. Mở file `assets/js/firebase-config.js` trong repo, dán config thật vào (thay các giá trị `DIEN_...`)
5. Vào tab **Rules** của Firestore, dán:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /kmh_weeks/{weekId} {
         allow read, write: if true;
       }
     }
   }
   ```
6. Commit + push lại file `firebase-config.js` đã điền config
7. Mở `dongquan.net/kmh/` → bấm "Thêm tuần mới" để test

> ⚠️ Rule ở trên cho phép **ai có link cũng ghi được dữ liệu** (vì site không có đăng nhập, theo đúng yêu cầu ban đầu là để công khai). Phù hợp cho quy mô gia đình/cá nhân, nhưng không nên chia sẻ link rộng rãi nếu không muốn người lạ sửa dữ liệu.

### 4. Thêm nội dung mới (Chủ điểm ngữ pháp / Bài tập làm thêm / Blog)
- Build file `.html` mới (có thể copy 1 file mẫu có sẵn trong `grammar/`, `extra/`, hoặc `blog/posts/` rồi sửa nội dung)
- Đặt đúng tag `<title>Tên bài học</title>` trong file — đây là tiêu đề sẽ hiện ra ở trang danh sách
- Với bài blog, đặt tên file theo định dạng `YYYY-MM-DD-slug.html` (ví dụ `2026-09-01-ngay-dau-tuan.html`) để tự sắp theo ngày
- Copy file vào đúng thư mục (`grammar/`, `extra/`, hoặc `blog/posts/`), commit + push
- **Không cần sửa gì thêm** — GitHub Actions (`.github/workflows/build-index.yml`) sẽ tự quét và cập nhật `index.json`, danh sách trên site tự hiện ra sau khoảng 1 phút

Muốn test script sinh danh sách ngay trên máy (không cần đợi GitHub Actions):
```bash
node scripts/build-index.js
```

## Cấu trúc thư mục
```
dongquan-net/
├── CNAME
├── index.html                # Trang chủ
├── 404.html
├── assets/
│   ├── css/style.css         # Toàn bộ design system (theme "vở bài tập")
│   └── js/
│       ├── main.js
│       ├── firebase-config.js   # ⚠️ CẦN ĐIỀN CONFIG THẬT
│       └── list-loader.js       # dùng chung cho grammar/extra/blog
├── kmh/                       # Module Bài tập KMH (Firebase)
│   ├── index.html
│   └── kmh.js
├── grammar/                   # Chủ điểm ngữ pháp (tự đồng bộ qua GitHub Actions)
│   ├── index.html
│   ├── index.json             # tự sinh, không sửa tay
│   └── topic-01-present-simple.html   (file mẫu)
├── extra/                      # Bài tập làm thêm (tương tự grammar/)
│   ├── index.html
│   ├── index.json
│   └── ex-01-vocabulary-animals.html  (file mẫu)
├── blog/
│   ├── index.html
│   └── posts/
│       ├── index.json
│       └── 2026-08-11-chao-mung.html  (bài mẫu)
├── scripts/build-index.js     # Script sinh index.json
└── .github/workflows/build-index.yml  # GitHub Actions tự chạy script trên
```

## Ghi chú thiết kế
Theme "vở bài tập" (notebook): giấy kem, gáy vở xoắn ở header, dấu mộc (stamp) đỏ/xanh cho trạng thái Pending/Finish. Font: Baloo 2 (tiêu đề), Work Sans (nội dung), JetBrains Mono (ngày/nhãn). Responsive: 2 cột trên iPad, 3–4 cột trên desktop.
