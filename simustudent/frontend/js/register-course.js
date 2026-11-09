// register-course.js — Logic dang ky mon hoc SimuStudent

// ============================================================
// STATE
// ============================================================
let selectedSubjects = new Set();
let currentSemester  = "HK1";
let currentFilter    = "all";
let searchQuery      = "";
const MAX_CREDITS    = { HK1: 25, HK2: 25, He: 10 };
const MIN_CREDITS    = { HK1: 12, HK2: 12, He: 6  };

// Load saved simulation state
const simState = JSON.parse(localStorage.getItem("simState") || "{}");
const accumulatedCredits = simState.accumulatedCredits || 0;
const currentYear  = simState.currentYear  || 1;
const currentTerm  = simState.currentTerm  || "HK1";
const studentName  = simState.studentName  || "Lâm Hoàng Phúc";

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Init display
  document.getElementById("header-accumulated").textContent = accumulatedCredits;
  document.getElementById("nav-student-name").textContent = studentName;
  document.getElementById("nav-year-term").textContent =
    "Năm " + currentYear + " – " + (currentTerm === "He" ? "Kỳ hè" : currentTerm);

  // Set semester from state
  currentSemester = currentTerm;
  document.querySelectorAll(".sem-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.sem === currentSemester);
  });

  updateSoundIcon();
  renderSubjects();
  updateTracker();
});

// Sound Toggle
function toggleSound() {
  if (window.sound) {
    const isMuted = window.sound.toggleMute();
    updateSoundIcon();
    showToast(isMuted ? "Đã tắt âm thanh" : "Đã bật âm thanh", "secondary");
  }
}

function updateSoundIcon() {
  const icon = document.getElementById("sound-icon");
  if (!icon || !window.sound) return;
  if (window.sound.muted) {
    icon.className = "fa-solid fa-volume-xmark text-danger";
  } else {
    icon.className = "fa-solid fa-volume-high text-primary";
  }
}

// ============================================================
// SEMESTER SELECT
// ============================================================
function selectSemester(btn, sem) {
  if (window.sound) window.sound.click();
  currentSemester = sem;
  document.querySelectorAll(".sem-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  selectedSubjects.clear();
  renderSubjects();
  updateTracker();
  showToast("Chọn kỳ: " + (sem === "He" ? "Kỳ hè" : sem), "");
}

// ============================================================
// FILTER & SEARCH
// ============================================================
function filterSubjects(btn, cat) {
  if (window.sound) window.sound.click();
  currentFilter = cat;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderSubjects();
}

function searchSubjects(val) {
  searchQuery = val.toLowerCase().trim();
  renderSubjects();
}

function getFilteredSubjects() {
  return ALL_SUBJECTS.filter(s => {
    const inSem    = s.semester.includes(currentSemester);
    const inCat    = currentFilter === "all" || s.category === currentFilter;
    const inSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery) ||
      s.code.toLowerCase().includes(searchQuery);
    return inSem && inCat && inSearch;
  });
}

// ============================================================
// RENDER SUBJECT GRID
// ============================================================
function renderSubjects() {
  const grid     = document.getElementById("subject-grid");
  const subjects = getFilteredSubjects();
  const maxTC    = MAX_CREDITS[currentSemester];

  if (subjects.length === 0) {
    grid.innerHTML = `
      <div class="text-center py-5" style="color:var(--gray-500)">
        <i class="fa-solid fa-magnifying-glass fa-2x mb-3" style="opacity:.4"></i>
        <p>Không tìm thấy môn học phù hợp với bộ lọc</p>
      </div>`;
    return;
  }

  const grouped = {};
  subjects.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  let html = "";
  for (const cat in grouped) {
    html += `<div class="subject-category-header">
      <i class="fa-solid fa-tag fa-xs me-1"></i>${CATEGORY_LABELS[cat]} (${grouped[cat].length} môn)
    </div>
    <div class="row g-3 mb-2">`;

    grouped[cat].forEach(s => {
      const isSelected = selectedSubjects.has(s.id);
      const currentTC  = getTotalCredits();
      const wouldExceed = !isSelected && (currentTC + s.credits > maxTC);
      const isDisabled = wouldExceed && !isSelected;

      html += `
      <div class="col-md-6 col-lg-4" id="card-wrap-${s.id}">
        <div class="subject-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}"
             onclick="toggleSubject(${s.id})">
          <div class="check-icon" id="check-${s.id}">
            ${isSelected ? '<i class="fa-solid fa-check fa-xs"></i>' : ""}
          </div>
          <div class="subject-name">${s.name}</div>
          <div class="subject-code">${s.code}</div>
          <div class="subject-meta">
            <span class="badge-credit"><i class="fa-solid fa-coins fa-xs me-1"></i>${s.credits} TC</span>
            <span class="badge-difficulty diff-${s.difficulty}">${DIFFICULTY_LABELS[s.difficulty]}</span>
          </div>
        </div>
      </div>`;
    });

    html += `</div>`;
  }

  grid.innerHTML = html;
}

// ============================================================
// TOGGLE SUBJECT
// ============================================================
function toggleSubject(id) {
  const subject = ALL_SUBJECTS.find(s => s.id === id);
  if (!subject) return;

  const maxTC = MAX_CREDITS[currentSemester];

  if (selectedSubjects.has(id)) {
    selectedSubjects.delete(id);
    if (window.sound) window.sound.select();
    showToast("Đã bỏ: " + subject.name, "");
  } else {
    const newTotal = getTotalCredits() + subject.credits;
    if (newTotal > maxTC) {
      if (window.sound) window.sound.warning();
      showToast("Vượt quá giới hạn " + maxTC + " tín chỉ!", "danger");
      return;
    }
    selectedSubjects.add(id);
    if (window.sound) window.sound.select();
    showToast("Đã thêm: " + subject.name, "success");
  }

  renderSubjects();
  updateTracker();
}

function getTotalCredits() {
  let total = 0;
  selectedSubjects.forEach(id => {
    const s = ALL_SUBJECTS.find(x => x.id === id);
    if (s) total += s.credits;
  });
  return total;
}

// ============================================================
// UPDATE TRACKER PANEL
// ============================================================
function updateTracker() {
  const total  = getTotalCredits();
  const maxTC  = MAX_CREDITS[currentSemester];
  const minTC  = MIN_CREDITS[currentSemester];
  const pct    = Math.min((total / maxTC) * 100, 100);
  const count  = selectedSubjects.size;

  document.getElementById("min-credits-label").textContent = minTC + " TC";

  const displayEl = document.getElementById("credit-display");
  displayEl.innerHTML = total + ' <small>/ ' + maxTC + ' TC</small>';

  const barEl = document.getElementById("credit-bar");
  barEl.style.width = pct + "%";

  let colorClass = "";
  if (total > maxTC)       colorClass = "danger";
  else if (total >= 21)    colorClass = "warning";
  else if (total >= minTC) colorClass = "";

  displayEl.className = "credit-count " + colorClass;
  barEl.className     = "credit-bar-fill " + colorClass;

  document.getElementById("remaining-label").textContent =
    "Còn trống: " + Math.max(0, maxTC - total) + " TC";

  const statusEl = document.getElementById("credit-status");
  if (total === 0) {
    statusEl.className = "credit-status-msg empty";
    statusEl.textContent = "Chưa chọn môn nào";
  } else if (total > maxTC) {
    statusEl.className = "credit-status-msg over";
    statusEl.textContent = "Vượt quá giới hạn " + maxTC + " tín chỉ!";
  } else if (total >= minTC && total <= 20) {
    statusEl.className = "credit-status-msg ok";
    statusEl.textContent = "Hợp lệ – Tải học tập vừa phải";
  } else if (total > 20 && total <= maxTC) {
    statusEl.className = "credit-status-msg high";
    statusEl.textContent = "Cực nặng – Áp lực cao, nhanh ra trường!";
  } else {
    statusEl.className = "credit-status-msg low";
    statusEl.textContent = "Thiếu tín chỉ (tối thiểu " + minTC + " TC)";
  }

  document.getElementById("stat-subjects").textContent = count;
  document.getElementById("selected-count-badge").textContent = count + " môn";
  const hoursPerWeek = total * 3;
  document.getElementById("stat-hours").textContent = hoursPerWeek;

  if (count > 0) {
    let totalDiff = 0;
    selectedSubjects.forEach(id => {
      const s = ALL_SUBJECTS.find(x => x.id === id);
      if (s) totalDiff += s.difficulty;
    });
    const avgDiff = (totalDiff / count).toFixed(1);
    document.getElementById("stat-difficulty").textContent = avgDiff;
  } else {
    document.getElementById("stat-difficulty").textContent = "-";
  }

  renderSelectedList();
  updateWarning(total, maxTC, minTC);

  const canConfirm = total >= minTC && total <= maxTC;
  document.getElementById("btn-confirm").disabled = !canConfirm;
}

function renderSelectedList() {
  const listEl = document.getElementById("selected-list");

  if (selectedSubjects.size === 0) {
    listEl.innerHTML = `<p style="font-size:.8rem;color:var(--gray-500);text-align:center;padding:16px 0">
      Nhấn vào môn học để thêm vào danh sách
    </p>`;
    return;
  }

  let html = "";
  selectedSubjects.forEach(id => {
    const s = ALL_SUBJECTS.find(x => x.id === id);
    if (!s) return;
    html += `
    <div class="selected-item">
      <div class="item-name">${s.name}</div>
      <span class="item-credit">${s.credits} TC</span>
      <button class="item-remove" onclick="removeSubject(${s.id})" title="Xóa môn">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>`;
  });

  listEl.innerHTML = html;
}

function removeSubject(id) {
  selectedSubjects.delete(id);
  if (window.sound) window.sound.click();
  const s = ALL_SUBJECTS.find(x => x.id === id);
  if (s) showToast("Đã bỏ: " + s.name, "");
  renderSubjects();
  updateTracker();
}

function updateWarning(total, maxTC, minTC) {
  const warnEl = document.getElementById("warning-box");

  if (total > maxTC) {
    warnEl.style.display = "block";
    warnEl.style.background = "var(--danger-light)";
    warnEl.style.color = "var(--danger)";
    warnEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Vượt quá ' + maxTC + ' tín chỉ. Vui lòng bỏ bớt môn.';
  } else if (total > 20) {
    warnEl.style.display = "block";
    warnEl.style.background = "var(--warning-light)";
    warnEl.style.color = "var(--warning)";
    warnEl.innerHTML = '<i class="fa-solid fa-fire me-1"></i> Đăng ký > 20 TC: Áp lực rất cao, cần ngủ đủ giấc trong kỳ!';
  } else if (total > 0 && total < minTC) {
    warnEl.style.display = "block";
    warnEl.style.background = "var(--warning-light)";
    warnEl.style.color = "var(--warning)";
    warnEl.innerHTML = '<i class="fa-solid fa-circle-info me-1"></i> Cần đăng ký ít nhất ' + minTC + ' TC để bắt đầu kỳ học.';
  } else {
    warnEl.style.display = "none";
  }
}

// ============================================================
// CONFIRM REGISTRATION
// ============================================================
function confirmRegistration() {
  const total = getTotalCredits();
  const maxTC = MAX_CREDITS[currentSemester];
  const minTC = MIN_CREDITS[currentSemester];

  if (total < minTC || total > maxTC) return;

  if (window.sound) window.sound.fanfare();

  const chosenSubjects = [];
  selectedSubjects.forEach(id => {
    const s = ALL_SUBJECTS.find(x => x.id === id);
    if (s) chosenSubjects.push({ ...s, studyHours: s.credits * 2 });
  });

  const semRegistration = {
    semester: currentSemester,
    year: currentYear,
    subjects: chosenSubjects,
    totalCredits: total,
    registeredAt: new Date().toISOString()
  };

  localStorage.setItem("currentSemesterRegistration", JSON.stringify(semRegistration));
  localStorage.setItem("simState", JSON.stringify({
    ...simState,
    currentTerm: currentSemester,
    currentYear: currentYear,
    accumulatedCredits: accumulatedCredits,
    studentName: studentName,
    health: simState.health ?? 100,
    stress: simState.stress ?? 0,
    knowledge: simState.knowledge ?? 0,
    gpa: simState.gpa ?? 0.0
  }));

  showToast("Đăng ký thành công! Đang chuyển đến kỳ học...", "success");

  setTimeout(() => {
    window.location.href = "play.html";
  }, 1200);
}

function showToast(msg, type) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = "toast-custom " + (type || "");
  setTimeout(() => toast.classList.add("show"), 10);
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}