// play.js — SimuStudent Simulation Engine

const EVENTS = [
  {
    id: "sick", emoji: "🤒", title: "Bị ốm nặng!", type: "bad",
    desc: "Bạn bị cảm sốt li bì suốt mấy ngày. Việc học tập bị gián đoạn đáng kể.",
    effects: { health: -20, stress: +15, knowledge: -5 },
    effectLabel: "Sức khỏe -20, Stress +15",
    effectClass: "neg",
    choices: [
      { text: "Nghỉ ngơi, uống thuốc cho mau khỏe", bonus: { health: +10 } },
      { text: "Cố gắng gượng dậy học tiếp", bonus: { knowledge: +5, health: -8 } }
    ]
  },
  {
    id: "deadline", emoji: "😱", title: "Deadline dồn dập!", type: "bad",
    desc: "Đột nhiên 2 môn cùng ra hạn nộp bài tập lớn trong tuần này. Áp lực tăng cao!",
    effects: { stress: +20, health: -10 },
    effectLabel: "Stress +20, Sức khỏe -10",
    effectClass: "neg",
    choices: [
      { text: "Thức đêm hoàn thành đồ án", bonus: { knowledge: +10, health: -15 } },
      { text: "Làm vừa sức, chấp nhận điểm không cao", bonus: { stress: -10 } }
    ]
  },
  {
    id: "outing", emoji: "🎉", title: "Hội bạn rủ đi quẩy cuối tuần!", type: "neutral",
    desc: "Hội bạn thân rủ đi cà phê và xem phim giải tỏa áp lực học tập.",
    effects: { stress: -15 },
    effectLabel: "Stress -15 nếu đi chơi",
    effectClass: "pos",
    choices: [
      { text: "Đi thôi, xả stress cái đã!", bonus: { stress: -15, knowledge: -5 } },
      { text: "Từ chối, ở nhà cày code", bonus: { knowledge: +10, stress: +8 } }
    ]
  },
  {
    id: "quiz_surprise", emoji: "📝", title: "Kiểm tra 15 phút đột xuất!", type: "bad",
    desc: "Vừa vào lớp thầy đã phát giấy kiểm tra nhanh kiến thức tuần trước.",
    effects: { stress: +10 },
    effectLabel: "Stress +10",
    effectClass: "neg",
    choices: [
      { text: "Tập trung nhớ lại kiến thức để làm", bonus: { knowledge: +8, health: -3 } },
      { text: "Khoanh bừa theo cảm tính", bonus: { stress: -5, knowledge: -5 } }
    ]
  },
  {
    id: "scholarship", emoji: "🏆", title: "Cơ hội học bổng nghiên cứu!", type: "good",
    desc: "Khoa thông báo xét học bổng khuyến khích tài năng. Cần bổ sung báo cáo đồ án.",
    effects: { stress: +5 },
    effectLabel: "Có thêm động lực lớn!",
    effectClass: "pos",
    choices: [
      { text: "Đăng ký ngay, không ngại khó!", bonus: { knowledge: +15, stress: +10 } },
      { text: "Thôi, tập trung qua các môn kỳ này trước", bonus: {} }
    ]
  },
  {
    id: "group_project", emoji: "👥", title: "Bạn cùng nhóm 'lặn' mất tăm!", type: "bad",
    desc: "Một thành viên trong nhóm đồ án không trả lời tin nhắn, sát ngày nộp bài.",
    effects: { stress: +18, health: -5 },
    effectLabel: "Stress +18, Sức khỏe -5",
    effectClass: "neg",
    choices: [
      { text: "Gánh team, làm bù phần của bạn đó", bonus: { knowledge: +12, health: -10 } },
      { text: "Báo cáo trung thực với giảng viên", bonus: { stress: -5 } }
    ]
  },
  {
    id: "workshop", emoji: "💻", title: "Workshop công nghệ từ doanh nghiệp", type: "good",
    desc: "CLB IT tổ chức buổi chia sẻ về kinh nghiệm phỏng vấn và công nghệ thực tế.",
    effects: { knowledge: +10 },
    effectLabel: "Kiến thức +10",
    effectClass: "pos",
    choices: [
      { text: "Tham gia để học hỏi kinh nghiệm", bonus: { knowledge: +12, stress: -5 } },
      { text: "Bận quá, dành thời gian nghỉ ngơi", bonus: { health: +5 } }
    ]
  }
];

let gs = {};
let registration = {};

function loadState() {
  const saved = localStorage.getItem("simState");
  gs = saved ? JSON.parse(saved) : {
    health: 100, stress: 0, knowledge: 0, gpa: 0.0,
    accumulatedCredits: 0, currentYear: 1, currentTerm: "HK1",
    studentName: "Lâm Hoàng Phúc",
    week: 1,
    weekHistory: [],
    courseKnowledge: {}
  };
  if (!gs.week) gs.week = 1;
  if (!gs.weekHistory) gs.weekHistory = [];
  if (!gs.courseKnowledge) gs.courseKnowledge = {};

  const reg = localStorage.getItem("currentSemesterRegistration");
  if (!reg) {
    alert("Không có thông tin đăng ký môn học. Vui lòng đăng ký trước!");
    window.location.href = "register-course.html";
    return false;
  }
  registration = JSON.parse(reg);

  registration.subjects.forEach(s => {
    if (!(s.id in gs.courseKnowledge)) gs.courseKnowledge[s.id] = 0;
  });
  return true;
}

function saveState() {
  try {
    localStorage.setItem("simState", JSON.stringify(gs));
  } catch (e) {
    console.warn("Lỗi lưu state:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!loadState()) return;

  const classH = Math.round(registration.totalCredits * 1.5);
  const classHoursEl = document.getElementById("class-hours");
  if (classHoursEl) classHoursEl.textContent = classH;

  const navNameEl = document.getElementById("nav-student-name");
  if (navNameEl) navNameEl.textContent = gs.studentName || "Lâm Hoàng Phúc";

  const studyMax = Math.min(80, 168 - classH - 56);
  const sliderStudy = document.getElementById("slider-study");
  if (sliderStudy) {
    sliderStudy.max = studyMax;
    sliderStudy.value = Math.min(30, Math.max(10, studyMax));
  }

  updateSoundIcon();
  updateDisplay();
  renderWeekStepper();
  renderCourseProgress();
  recalcBudget();
});

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

function updateDisplay() {
  const w = gs.week;
  const sem = registration ? registration.semester : "HK1";
  const semLabel = sem === "He" ? "Kỳ hè" : (sem === "HK1" ? "Học kỳ 1" : "Học kỳ 2");

  const headerTitle = document.getElementById("header-title");
  if (headerTitle) {
    headerTitle.innerHTML = '<i class="fa-solid fa-clock me-2"></i>Tuần ' + w + ' – ' + semLabel;
  }
  const headerSubtitle = document.getElementById("header-subtitle");
  if (headerSubtitle) {
    headerSubtitle.textContent =
      w <= 7 ? "Giai đoạn đầu kỳ: Tích lũy kiến thức nền tảng đều đặn!" :
      w === 8 ? "Tuần 8 – ĐỢT THI GIỮA KỲ (chiếm 40% điểm tổng)!" :
      w <= 14 ? "Giai đoạn nước rút: Tăng tốc hoàn thành đồ án & ôn tập!" :
      "TUẦN 15 – THI CUỐI KỲ (chiếm 60% điểm tổng)!";
  }

  const navWeek = document.getElementById("nav-week");
  if (navWeek) navWeek.textContent = w;
  const navCredits = document.getElementById("nav-credits");
  if (navCredits) navCredits.textContent = gs.accumulatedCredits;

  const headerGpa = document.getElementById("header-gpa");
  if (headerGpa) headerGpa.textContent = (gs.gpa || 0).toFixed(2);
  const headerAccum = document.getElementById("header-accum");
  if (headerAccum) headerAccum.textContent = gs.accumulatedCredits;

  setBar("knowledge", gs.knowledge);
  setBar("health",    gs.health);
  setBar("stress",    gs.stress);

  const infoWeek = document.getElementById("info-week");
  if (infoWeek) infoWeek.textContent = w;
  const infoCredits = document.getElementById("info-credits");
  if (infoCredits) infoCredits.textContent = registration.totalCredits;
  const infoSubjects = document.getElementById("info-subjects");
  if (infoSubjects) infoSubjects.textContent = registration.subjects.length;
  const infoGpa = document.getElementById("info-gpa");
  if (infoGpa) infoGpa.textContent = (gs.gpa || 0).toFixed(2);

  const btnText = document.getElementById("btn-next-text");
  const hint    = document.getElementById("week-hint");
  if (btnText) {
    if (w === 8) {
      btnText.innerHTML = '<i class="fa-solid fa-pencil me-2"></i>Thi giữa kỳ & Sang tuần 9';
    } else if (w === 15) {
      btnText.innerHTML = '<i class="fa-solid fa-award me-2"></i>Thi cuối kỳ & Xem bảng điểm';
    } else {
      btnText.innerHTML = '<i class="fa-solid fa-arrow-right me-2"></i>Sang tuần ' + (w + 1);
    }
  }
  if (hint) {
    hint.textContent = "Đang ở tuần " + w + " trên tổng số 15 tuần học kỳ";
  }
}

function setBar(name, val) {
  const clamped = Math.max(0, Math.min(100, val));
  const bar = document.getElementById("bar-" + name);
  const lbl = document.getElementById("val-" + name);
  if (bar) bar.style.width = clamped + "%";
  if (lbl) lbl.textContent = clamped + "%";
}

function renderWeekStepper() {
  const container = document.getElementById("week-stepper");
  if (!container) return;
  let html = "";
  for (let i = 1; i <= 15; i++) {
    const done    = i < gs.week;
    const current = i === gs.week;
    const midterm = i === 8;
    let cls = "week-dot";
    if (done)    cls += " done";
    if (current) cls += " current";
    if (midterm) cls += " midterm";

    const icon = done ? '<i class="fa-solid fa-check fa-xs"></i>' : i;
    html += `<div class="${cls}" title="${midterm ? "Thi giữa kỳ" : (i === 15 ? "Thi cuối kỳ" : "Tuần " + i)}">${icon}</div>`;
    if (i < 15) {
      html += `<div class="week-line ${done ? "done" : ""}"></div>`;
    }
  }
  container.innerHTML = html;
}

function recalcBudget() {
  const classH = Math.round(registration.totalCredits * 1.5);
  const study  = parseInt(document.getElementById("slider-study")?.value || 0);
  const rest   = parseInt(document.getElementById("slider-rest")?.value || 56);
  const fun    = parseInt(document.getElementById("slider-fun")?.value || 0);
  const used   = classH + study + rest + fun;
  const left   = 168 - used;

  const lblStudy = document.getElementById("label-study");
  if (lblStudy) lblStudy.textContent = study + " giờ";
  const lblRest = document.getElementById("label-rest");
  if (lblRest) lblRest.textContent = rest + " giờ";
  const lblFun = document.getElementById("label-fun");
  if (lblFun) lblFun.textContent = fun + " giờ";

  const budgetEl = document.getElementById("budget-display");
  const budgetLeft = document.getElementById("budget-left");
  if (budgetLeft) budgetLeft.textContent = left;

  const btnNext = document.getElementById("btn-next");
  if (budgetEl && btnNext) {
    if (left < 0) {
      budgetEl.style.background = "var(--danger-light)";
      budgetEl.style.color      = "var(--danger)";
      btnNext.disabled = true;
    } else if (left < 10) {
      budgetEl.style.background = "var(--warning-light)";
      budgetEl.style.color      = "var(--warning)";
      btnNext.disabled = false;
    } else {
      budgetEl.style.background = "var(--success-light)";
      budgetEl.style.color      = "var(--success)";
      btnNext.disabled = false;
    }
  }
}

function onSliderChange() {
  try { if (window.sound) window.sound.click(); } catch(e){}
  recalcBudget();
}

function renderCourseProgress() {
  const list = document.getElementById("course-progress-list");
  if (!list) return;
  let html = "";
  registration.subjects.forEach(s => {
    const k = Math.min(100, gs.courseKnowledge[s.id] || 0);
    const color = k >= 70 ? "var(--success)" : k >= 40 ? "var(--primary)" : "var(--warning)";
    html += `
    <div class="course-row">
      <div style="font-size:.78rem;font-weight:500;color:var(--gray-700);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${s.name}
      </div>
      <div class="course-knowledge-bar">
        <div class="course-knowledge-fill" style="width:${k}%;background:${color}"></div>
      </div>
      <div style="font-size:.75rem;font-weight:600;color:${color};min-width:32px;text-align:right">${k}%</div>
    </div>`;
  });
  list.innerHTML = html;
}

function advanceWeek() {
  const w       = gs.week;
  const classH  = Math.round(registration.totalCredits * 1.5);
  const study   = parseInt(document.getElementById("slider-study")?.value || 0);
  const rest    = parseInt(document.getElementById("slider-rest")?.value || 56);
  const fun     = parseInt(document.getElementById("slider-fun")?.value || 0);
  const total   = classH + study + rest + fun;

  if (total > 168) {
    try { if (window.sound) window.sound.warning(); } catch(e){}
    showToast("Vượt quá 168 giờ! Hãy bớt giờ lại.", "danger");
    return;
  }

  const studyEff    = Math.min(1, study / (registration.totalCredits * 2));
  const knowledgeGain = Math.round(studyEff * 8 + (classH / registration.totalCredits) * 2);
  const restScore  = rest >= 56 ? 1 : rest / 56;
  const healthDelta = Math.round(restScore * 3 - (gs.stress / 100) * 4 + (fun >= 7 ? 2 : 0) - 1);
  const creditLoad  = registration.totalCredits;
  const stressDelta = Math.round(
    (creditLoad > 20 ? 8 : creditLoad > 15 ? 5 : 3) -
    (fun >= 10 ? 3 : 0) -
    (rest >= 63 ? 2 : 0) +
    (gs.health < 40 ? 4 : 0)
  );

  registration.subjects.forEach(s => {
    const gain = Math.round(
      (study / (registration.subjects.length * 2)) * (1 + studyEff) +
      (classH / registration.subjects.length) * 0.5
    );
    gs.courseKnowledge[s.id] = Math.min(100, (gs.courseKnowledge[s.id] || 0) + gain);
  });

  gs.knowledge = Math.min(100, gs.knowledge + knowledgeGain);
  gs.health    = Math.max(0,   Math.min(100, gs.health + healthDelta));
  gs.stress    = Math.max(0,   Math.min(100, gs.stress + stressDelta));

  gs.weekHistory.push({ week: w, knowledge: gs.knowledge, health: gs.health, stress: gs.stress });
  gs.week++;
  saveState();

  if (w === 15) {
    try { if (window.sound) window.sound.fanfare(); } catch(e){}
    showToast("Thi cuối kỳ hoàn tất! Đang tính điểm tổng kết...", "success");
    setTimeout(() => window.location.href = "result.html", 1500);
    return;
  }

  const eventChance = Math.random();
  if (w !== 7 && w !== 14 && eventChance < 0.4) {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    showEvent(ev);
  } else {
    try { if (window.sound) window.sound.click(); } catch(e){}
    updateDisplay();
    renderWeekStepper();
    renderCourseProgress();
    showToast("Đã xong tuần " + w + "! Bắt đầu tuần " + gs.week, "success");
  }
}

function showEvent(ev) {
  try { if (window.sound) window.sound.event(); } catch(e){}

  document.getElementById("ev-emoji").textContent  = ev.emoji;
  document.getElementById("ev-title").textContent  = ev.title;
  document.getElementById("ev-desc").textContent   = ev.desc;

  const effEl = document.getElementById("ev-effect");
  if (effEl) {
    effEl.innerHTML = `<span class="effect-tag ${ev.effectClass}">${ev.effectLabel}</span>`;
  }

  if (ev.effects) {
    Object.entries(ev.effects).forEach(([k, v]) => {
      gs[k] = Math.max(0, Math.min(100, (gs[k] || 0) + v));
    });
    saveState();
  }

  const choicesEl = document.getElementById("ev-choices");
  if (choicesEl) {
    choicesEl.innerHTML = "";
    ev.choices.forEach((c, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `event-choice-btn ${i === 0 ? "primary-btn" : ""}`;
      btn.textContent = c.text;
      btn.onclick = function() {
        resolveEvent(c.bonus || {});
      };
      choicesEl.appendChild(btn);
    });
  }

  const overlay = document.getElementById("event-overlay");
  if (overlay) overlay.style.display = "flex";
}

function closeEventModal() {
  const overlay = document.getElementById("event-overlay");
  if (overlay) overlay.style.display = "none";
  updateDisplay();
  renderWeekStepper();
  renderCourseProgress();
}

function resolveEvent(bonus) {
  // 1. Luôn đóng modal lập tức
  const overlay = document.getElementById("event-overlay");
  if (overlay) overlay.style.display = "none";

  try { if (window.sound) window.sound.click(); } catch(e){}

  if (bonus && typeof bonus === "object") {
    Object.entries(bonus).forEach(([k, v]) => {
      gs[k] = Math.max(0, Math.min(100, (gs[k] || 0) + v));
    });
    saveState();
  }

  updateDisplay();
  renderWeekStepper();
  renderCourseProgress();
  showToast("Đã xử lý xong sự kiện!", "success");
}

function showToast(msg, type) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className   = "toast-custom " + (type || "");
  setTimeout(() => toast.classList.add("show"), 10);
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
}
