# Test Frontend Flow

## Demo accounts

Demo password:

- Development mac dinh: `Password123!`
- Neu moi truong da set `Seed:DemoPassword` thi dung gia tri do thay cho password mac dinh

Tai khoan seed de test:

- Admin: `admin@hcmut.edu.vn` / `Password123!`
- Lecturer demo co du seed data: `lecturer1@hcmut.edu.vn` / `Password123!`
- Student: `sv001@student.hcmut.edu.vn` / `Password123!`

Ghi chu:

- `lecturer1@hcmut.edu.vn` so huu `CS101` va `CS201`
- `CS101` da co 5 categories va 15 questions seed san
- `lecturer2@hcmut.edu.vn` chi thay subject cua rieng minh theo object-level authorization, nen co the thay it hoac khong co question seed san

## Seed behavior

- Backend seed demo da duoc doi sang che do idempotent: restart API se tu bo sung demo users, subjects, categories va question neu dang thieu
- Khong can noi long authorization de nhin thay seed data cua nguoi khac
- Lecturer chi thay subject do minh tao, chi tao question/exam trong subject cua minh

## API mapping duoc FE su dung

- `GET /api/subjects`: lay danh sach subject ma user hien tai duoc xem
- `GET /api/subjects/{subjectId}/categories`: lay categories theo subject
- `POST /api/subjects/{subjectId}/categories`: tao category cho subject
- `POST /api/questions`: tao question moi
- `PATCH /api/exams/{id}/publish`: publish draft exam sau khi da co session

Luu y ve question payload:

- `categoryId` co the gui `null` khi tao question khong gan category

## Recommended FE retest flow

1. Dang nhap `admin@hcmut.edu.vn`.
2. Vao `/admin/subjects`.
3. Tao subject moi neu can va gan `CreatedById` cho lecturer phu trach.
4. Neu subject chua co category, dung action `Them category` hoac `Tao category` ngay trong trang Subjects.
5. Dang xuat va dang nhap `lecturer1@hcmut.edu.vn`.
6. Vao `/lecturer/questions`.
7. Kiem tra block subject summary da hien ro subject lecturer duoc truy cap.
8. Neu subject chua co category, dung `Them category`; neu muon test nullable category thi tao question voi lua chon `Khong gan category`.
9. Tao them question moi bang `POST /api/questions`.
10. Vao `/lecturer/exams`, tao draft exam cho subject cua minh.
11. Vao chi tiet exam, tao it nhat mot session.
12. Bam `Publish exam`.
13. Dang xuat va dang nhap `sv001@student.hcmut.edu.vn`.
14. Vao danh sach exam/session cua student, start attempt, lam bai va submit.

## Expected results

- Lecturer dashboard va question bank chi hien thi du lieu thuoc subject cua lecturer dang login
- Question bank khong bi ket o modal tao question khi subject chua co category
- Admin co the tao subject, gan lecturer va tao category ngay tren FE
- Lecturer khong the tao question hay exam vao subject cua nguoi khac
