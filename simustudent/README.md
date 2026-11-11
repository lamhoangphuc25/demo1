# SimuStudent

> Mo phong hanh trinh sinh vien dai hoc - Do an Lap Trinh Web

**Nhom 3 | lap trinh web  | UTH | GVHD: Tran Thinh Manh Duc**

---

## Gioi thieu

SimuStudent la game mo phong hanh trinh 4 nam dai hoc:
- Dang ky mon hoc theo hoc ky (toi da 25 TC/ky)
- Phan bo thoi gian 168 gio/tuan (hoc, nghi, giai tri)
- Xu ly su kien bat ngo (bi om, deadline, hoc bong...)
- Tinh diem cuoi ky voi Giua ky 40% + Cuoi ky 60%
- Theo doi tien do tot nghiep (muc tieu 120 tin chi)

## Cong nghe

- **Frontend:** HTML5 + CSS3 + Bootstrap 5 + Vanilla JS + Chart.js
- **Backend:** Node.js + Express.js
- **Database:** MySQL 8.0
- **State (demo):** localStorage (khong can backend)

## Cau truc thu muc

```
simustudent/
├── frontend/
│   ├── index.html          # Trang chu
│   ├── register-course.html # Dang ky mon hoc
│   ├── play.html           # Mo phong 15 tuan
│   ├── result.html         # Ket qua hoc ky
│   ├── css/
│   │   └── style.css       # Global stylesheet
│   ├── js/
│   │   ├── subjects-data.js    # Du lieu mon hoc (mock)
│   │   ├── register-course.js  # Logic dang ky
│   │   ├── play.js             # Game engine
│   │   └── result.js           # Tinh diem
│   └── images/
└── backend/
    ├── server.js           # Express server
    ├── db.js               # MySQL pool
    ├── package.json
    ├── database.sql        # Schema + sample data
    ├── .env.example        # Cau hinh moi truong
    └── routes/
        ├── auth.js         # Dang ky / Dang nhap
        ├── subjects.js     # API lay mon hoc
        └── simulation.js   # API mo phong
```

## Chay Frontend (Demo - khong can backend)

Mo file `frontend/index.html` truc tiep tren trinh duyet, hoac dung Live Server:

```
# VS Code: Click chuot phai index.html -> Open with Live Server
```

## Cai dat va chay Backend

### 1. Cai MySQL, tao database:
```sql
mysql -u root -p < backend/database.sql
```

### 2. Cai Node.js dependencies:
```
cd backend
npm install
```

### 3. Tao file .env:
```
cp .env.example .env
# Sua DB_PASSWORD theo mat khau MySQL cua ban
```

### 4. Chay server:
```
npm run dev
# Server chay tai http://localhost:3000
```

## Game Rules

| Quy tac             | Gia tri                    |
|---------------------|---------------------------|
| TC toi thieu/ky     | 12 TC (he: 6 TC)          |
| TC toi da/ky        | 25 TC (he: 10 TC)         |
| TC tot nghiep       | 120 TC                    |
| Thoi gian/tuan      | 168 gio                   |
| Trong so giua ky    | 40%                       |
| Trong so cuoi ky    | 60%                       |
| Diem qua mon        | >= 4.0 / 10               |

## API Endpoints

| Method | Endpoint                    | Mo ta                    |
|--------|-----------------------------|--------------------------|
| POST   | /api/auth/register          | Dang ky tai khoan        |
| POST   | /api/auth/login             | Dang nhap                |
| POST   | /api/auth/logout            | Dang xuat                |
| GET    | /api/subjects/available     | Lay danh sach mon hoc    |
| POST   | /api/sim/start              | Bat dau simulation       |
| POST   | /api/sim/register-courses   | Dang ky mon hoc ky nay   |
| POST   | /api/sim/finish-term        | Ket thuc ky, tinh diem   |
| GET    | /api/sim/history            | Lich su cac ky da hoc    |


---
*Do an mon Lap Trinh Web - UTH 2024*
