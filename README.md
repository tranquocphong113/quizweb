# Quiz Online Website

## 1. Giới thiệu

Quiz Online Website là một website làm bài trắc nghiệm trực tuyến được xây dựng cho môn Lập Trình Web.  
Hệ thống cho phép người dùng đăng ký, đăng nhập, tạo quiz, tạo phòng chơi, tham gia phòng bằng mã phòng, làm bài có giới hạn thời gian, xem kết quả, bảng xếp hạng và lịch sử làm bài.

Dự án được xây dựng với giao diện đơn giản, dễ sử dụng và phù hợp để demo các chức năng cơ bản của một hệ thống quiz online.

---

## 2. Thành viên nhóm

- Hoàng Xuân Kỳ
- Trần Quốc Phong
- Phạm Hoàng Duy
- Lâm Văn Hậu

---

## 3. Chức năng chính

### Người dùng

- Đăng ký tài khoản
- Đăng nhập tài khoản
- Đăng xuất
- Xem lịch sử các bài quiz đã làm

### Quiz

- Tạo quiz mới
- Thêm câu hỏi
- Thêm 4 đáp án A, B, C, D
- Chọn đáp án đúng
- Thiết lập thời gian làm bài

### Phòng quiz

- Tạo phòng quiz
- Sinh mã phòng ngẫu nhiên
- Tham gia phòng bằng mã phòng
- Hiển thị danh sách người chơi trong phòng chờ

### Làm bài

- Hiển thị câu hỏi và các đáp án
- Chọn đáp án
- Hiển thị đáp án đúng/sai
- Có đồng hồ đếm ngược cho toàn bộ bài quiz
- Nộp bài sau khi hoàn thành

### Kết quả

- Hiển thị số câu đúng / tổng số câu
- Hiển thị tỉ lệ phần trăm câu đúng
- Hiển thị bảng xếp hạng của phòng hiện tại
- Lưu lịch sử làm bài theo từng tài khoản

---

## 4. Công nghệ sử dụng

- HTML
- CSS
- JavaScript
- PHP
- LocalStorage
- XAMPP / Apache

---

## 5. Cấu trúc thư mục

```text
quiz-online-website/
│
├──api/
│    ├── auth.php
│    ├── db.php
│    ├── quiz.php
│    ├── room.php
│    └── score.php
│
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── dashboard.css
│   └── quiz.css
│
├── js/
│   └── app.js
│
├── model/
│   ├── api.js
│   └── state.js
│
├── index.php
├── README.md
└── quiz.html
