// subjects-data.js — Danh sach mon hoc UTH CNTT
// Moi mon co: id, code, name, credits, difficulty(1-5), category, semester

const ALL_SUBJECTS = [
  // ========== DAI CUONG ==========
  { id: 1,  code: "TOAN001", name: "Toán cao cấp A1",             credits: 3, difficulty: 2, category: "general", semester: ["HK1"] },
  { id: 2,  code: "TOAN002", name: "Toán cao cấp A2",             credits: 3, difficulty: 3, category: "general", semester: ["HK2"] },
  { id: 3,  code: "VLY001",  name: "Vật lý đại cương",            credits: 3, difficulty: 2, category: "general", semester: ["HK1","HK2"] },
  { id: 4,  code: "ANH001",  name: "Tiếng Anh cơ bản 1",          credits: 3, difficulty: 1, category: "general", semester: ["HK1"] },
  { id: 5,  code: "ANH002",  name: "Tiếng Anh cơ bản 2",          credits: 3, difficulty: 2, category: "general", semester: ["HK2"] },
  { id: 6,  code: "GDCT001", name: "Chính trị học",               credits: 2, difficulty: 1, category: "general", semester: ["HK1","HK2"] },
  { id: 7,  code: "GDTC001", name: "Giáo dục thể chất",           credits: 2, difficulty: 1, category: "general", semester: ["HK1","HK2"] },
  { id: 8,  code: "PSYC001", name: "Tâm lý học đại cương",        credits: 2, difficulty: 1, category: "general", semester: ["HK1","HK2","He"] },
  { id: 9,  code: "TOAN003", name: "Xác suất thống kê",           credits: 3, difficulty: 3, category: "general", semester: ["HK1","HK2"] },
  { id: 10, code: "MATH004", name: "Toán rời rạc",                credits: 3, difficulty: 4, category: "general", semester: ["HK1","HK2"] },

  // ========== CO SO NGANH ==========
  { id: 11, code: "CNTT001", name: "Nhập môn công nghệ thông tin", credits: 3, difficulty: 1, category: "cs", semester: ["HK1"] },
  { id: 12, code: "CNTT002", name: "Kiến trúc máy tính",           credits: 3, difficulty: 3, category: "cs", semester: ["HK1","HK2"] },
  { id: 13, code: "CNTT003", name: "Hệ điều hành",                 credits: 3, difficulty: 4, category: "cs", semester: ["HK1","HK2"] },
  { id: 14, code: "CNTT004", name: "Mạng máy tính",                credits: 3, difficulty: 4, category: "cs", semester: ["HK1","HK2"] },
  { id: 15, code: "CNTT005", name: "Cấu trúc dữ liệu và giải thuật", credits: 3, difficulty: 5, category: "cs", semester: ["HK1","HK2"] },
  { id: 16, code: "CNTT006", name: "Cơ sở dữ liệu",               credits: 3, difficulty: 3, category: "cs", semester: ["HK1","HK2","He"] },
  { id: 17, code: "CNTT007", name: "Lý thuyết đồ thị",            credits: 2, difficulty: 4, category: "cs", semester: ["HK2"] },
  { id: 18, code: "CNTT008", name: "An toàn thông tin",            credits: 3, difficulty: 4, category: "cs", semester: ["HK2","He"] },
  { id: 19, code: "CNTT009", name: "Trí tuệ nhân tạo",            credits: 3, difficulty: 5, category: "cs", semester: ["HK2","He"] },
  { id: 20, code: "CNTT010", name: "Phân tích và thiết kế hệ thống", credits: 3, difficulty: 3, category: "cs", semester: ["HK1","HK2"] },

  // ========== LAP TRINH ==========
  { id: 21, code: "LT001",   name: "Lập trình C cơ bản",          credits: 3, difficulty: 2, category: "dev", semester: ["HK1"] },
  { id: 22, code: "LT002",   name: "Lập trình hướng đối tượng",   credits: 3, difficulty: 3, category: "dev", semester: ["HK1","HK2"] },
  { id: 23, code: "LT003",   name: "Lập trình web",               credits: 3, difficulty: 3, category: "dev", semester: ["HK1","HK2","He"] },
  { id: 24, code: "LT004",   name: "Lập trình di động",           credits: 3, difficulty: 4, category: "dev", semester: ["HK2","He"] },
  { id: 25, code: "LT005",   name: "Lập trình Python",            credits: 3, difficulty: 2, category: "dev", semester: ["HK1","HK2","He"] },
  { id: 26, code: "LT006",   name: "Phát triển ứng dụng Java",    credits: 3, difficulty: 4, category: "dev", semester: ["HK2"] },
  { id: 27, code: "LT007",   name: "Lập trình Node.js",           credits: 3, difficulty: 3, category: "dev", semester: ["HK2","He"] },
  { id: 28, code: "LT008",   name: "Lập trình React",             credits: 3, difficulty: 4, category: "dev", semester: ["HK2","He"] },
  { id: 29, code: "LT009",   name: "DevOps và CI/CD",             credits: 2, difficulty: 4, category: "dev", semester: ["HK2","He"] },
  { id: 30, code: "LT010",   name: "Đồ án lập trình web",         credits: 3, difficulty: 3, category: "dev", semester: ["HK2","He"] },

  // ========== HE THONG ==========
  { id: 31, code: "SYS001",  name: "Điện toán đám mây",           credits: 3, difficulty: 4, category: "sys", semester: ["HK2","He"] },
  { id: 32, code: "SYS002",  name: "Quản trị cơ sở dữ liệu",     credits: 3, difficulty: 3, category: "sys", semester: ["HK1","HK2"] },
  { id: 33, code: "SYS003",  name: "Quản trị mạng",               credits: 3, difficulty: 4, category: "sys", semester: ["HK2"] },
  { id: 34, code: "SYS004",  name: "Kiểm thử phần mềm",           credits: 3, difficulty: 3, category: "sys", semester: ["HK1","HK2","He"] },
  { id: 35, code: "SYS005",  name: "Công nghệ phần mềm",          credits: 3, difficulty: 4, category: "sys", semester: ["HK1","HK2"] },
];

const CATEGORY_LABELS = {
  general: "Đại cương",
  cs: "Cơ sở ngành",
  dev: "Lập trình",
  sys: "Hệ thống"
};

const DIFFICULTY_LABELS = ["", "Dễ", "Dễ", "Trung bình", "Khó", "Rất khó"];