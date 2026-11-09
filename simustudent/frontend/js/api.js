// api.js — Bridge giữa Frontend và Backend API
// Cho phép chuyển đổi linh hoạt: Offline mode (localStorage) vs Online mode (Node.js API)

const API_CONFIG = {
  // Đặt true khi chạy server Node.js http://localhost:3000
  // Đặt false để demo offline cho nhóm hoặc thầy xem trực tiếp từ file
  useBackend: false,
  baseUrl: "http://localhost:3000/api"
};

const SimuAPI = {
  // Lấy danh sách môn học
  async getSubjects(semester = "HK1") {
    if (!API_CONFIG.useBackend) {
      if (typeof ALL_SUBJECTS !== "undefined") {
        return ALL_SUBJECTS.filter(s => s.semester.includes(semester));
      }
      return [];
    }
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/subjects/available?semester=${semester}`);
      const data = await res.json();
      return data.subjects || [];
    } catch (err) {
      console.warn("Lỗi kết nối Backend API, tự động fallback về mock data:", err);
      return typeof ALL_SUBJECTS !== "undefined" ? ALL_SUBJECTS.filter(s => s.semester.includes(semester)) : [];
    }
  },

  // Đăng ký tài khoản
  async register(username, password, fullName, mssv) {
    if (!API_CONFIG.useBackend) {
      const users = JSON.parse(localStorage.getItem("simUsers") || "[]");
      if (users.find(u => u.username === username)) throw new Error("Tên đăng nhập đã tồn tại");
      const user = { id: Date.now(), username, fullName, mssv };
      users.push(user);
      localStorage.setItem("simUsers", JSON.stringify(users));
      return { success: true, user };
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, full_name: fullName, mssv })
    });
    return res.json();
  },

  // Đăng nhập
  async login(username, password) {
    if (!API_CONFIG.useBackend) {
      return { success: true, user: { username, full_name: "Lâm Hoàng Phúc", mssv: "079205028825" } };
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Bắt đầu mô phỏng
  async startSimulation() {
    if (!API_CONFIG.useBackend) {
      return { simId: "local_" + Date.now() };
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/sim/start`, { method: "POST" });
    return res.json();
  },

  // Lưu đăng ký môn
  async registerCourses(semester, year, subjectIds) {
    if (!API_CONFIG.useBackend) {
      return { success: true };
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/sim/register-courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semester, year, subjectIds })
    });
    return res.json();
  },

  // Xử lý tuần mô phỏng
  async processWeek(week, allocation) {
    if (!API_CONFIG.useBackend) {
      return { success: true };
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/sim/process-week`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week, allocation })
    });
    return res.json();
  },

  // Hoàn thành kỳ học
  async finishSemester(semesterId, courseScores) {
    if (!API_CONFIG.useBackend) {
      return { success: true };
    }
    const res = await fetch(`${API_CONFIG.baseUrl}/sim/finish-term`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semesterId, courseScores })
    });
    return res.json();
  }
};