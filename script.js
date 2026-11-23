/* =========================================================
   منطق حاسبة المعدل النقطي الشامل (نظام 4.00)
   تقبل الدرجات كأعداد صحيحة فقط من 0 إلى 100
   ========================================================= */

const coursesBody = document.getElementById("coursesBody");
const addCourseBtn = document.getElementById("addCourseBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const resetBtn = document.getElementById("resetBtn");

const totalGpaEl = document.getElementById("totalGpa");
const overallRatingEl = document.getElementById("overallRating");
const gpaProgressBar = document.getElementById("gpaProgressBar");
const coursesCountEl = document.getElementById("coursesCount");
const totalCreditsEl = document.getElementById("totalCredits");
const totalPointsEl = document.getElementById("totalPoints");

/**
 * تحويل الدرجة الصحيحة (0 - 100) إلى المكافئ النقطي والتقدير الحرفي
 */
function convertScore(score) {
  if (score >= 98) return { points: 4.00, letter: "A+", style: "high" };
  if (score >= 95) return { points: 3.75, letter: "A",  style: "high" };
  if (score >= 90) return { points: 3.50, letter: "A-", style: "high" };
  if (score >= 85) return { points: 3.25, letter: "B+", style: "mid" };
  if (score >= 80) return { points: 3.00, letter: "B",  style: "mid" };
  if (score >= 75) return { points: 2.75, letter: "B-", style: "mid" };
  if (score >= 70) return { points: 2.50, letter: "C+", style: "mid" };
  if (score >= 65) return { points: 2.25, letter: "C",  style: "mid" };
  if (score >= 60) return { points: 2.00, letter: "C-", style: "mid" };
  if (score >= 55) return { points: 1.75, letter: "D+", style: "cond" };
  if (score >= 50) return { points: 1.50, letter: "D",  style: "cond" };
  return { points: 0.00, letter: "F", style: "fail" };
}

/**
 * تحديد التقدير العام وفق المعدل النقطي
 */
function getOverallRating(gpa) {
  if (gpa >= 3.75) return { text: "شرف", cssClass: "excellent" };
  if (gpa >= 3.25) return { text: "امتياز", cssClass: "excellent" };
  if (gpa >= 2.75) return { text: "جيد جداً", cssClass: "good" };
  if (gpa >= 2.25) return { text: "جيد", cssClass: "good" };
  if (gpa >= 2.00) return { text: "مقبول", cssClass: "pass" };
  return { text: "إنذار أكاديمي (أقل من 2.00)", cssClass: "warning" };
}

/**
 * إضافة صف مقرر جديد إلى الجدول
 */
function addCourseRow(name = "", credits = 3, score = "") {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>
      <input type="text" class="course-name" placeholder="مثال: برمجة 1" value="${name}" />
    </td>
    <td>
      <select class="course-credits">
        <option value="3" ${credits == 3 ? "selected" : ""}>3 ساعات</option>
        <option value="2" ${credits == 2 ? "selected" : ""}>2 ساعتان</option>
        <option value="1" ${credits == 1 ? "selected" : ""}>1 ساعة</option>
        <option value="4" ${credits == 4 ? "selected" : ""}>4 ساعات</option>
      </select>
    </td>
    <td>
      <input
        type="number"
        class="course-score"
        min="0"
        max="100"
        step="1"
        inputmode="numeric"
        placeholder="0 - 100"
        value="${score}"
      />
    </td>
    <td><span class="points-cell">—</span></td>
    <td><span class="grade-pill">—</span></td>
    <td>
      <button type="button" class="delete-btn" title="حذف المقرر">×</button>
    </td>
  `;

  const scoreInput = tr.querySelector(".course-score");
  const creditsSelect = tr.querySelector(".course-credits");
  const deleteBtn = tr.querySelector(".delete-btn");

  // منع إدخال الفواصل العشرية أو الإشارات لضمان أعداد صحيحة فقط
  scoreInput.addEventListener("keydown", (e) => {
    if ([".", ",", "e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  });

  // تنظيف أي لصق يحتوي على كسور أو رموز غير رقمية
  scoreInput.addEventListener("input", () => {
    const cleaned = scoreInput.value.replace(/[^0-9]/g, "");
    if (scoreInput.value !== cleaned) {
      scoreInput.value = cleaned;
    }
    calculateGPA();
  });

  creditsSelect.addEventListener("change", calculateGPA);

  deleteBtn.addEventListener("click", () => {
    tr.remove();
    if (coursesBody.children.length === 0) {
      addCourseRow();
    }
    calculateGPA();
  });

  coursesBody.appendChild(tr);
  calculateGPA();
}

/**
 * حساب المعدل النقطي الشامل وتحديث النتائج فوراً
 */
function calculateGPA() {
  const rows = coursesBody.querySelectorAll("tr");
  let totalCredits = 0;
  let totalPoints = 0;
  let validCourses = 0;

  rows.forEach((row) => {
    const credits = parseInt(row.querySelector(".course-credits").value, 10) || 0;
    const scoreInput = row.querySelector(".course-score");
    const rawValue = scoreInput.value.trim();
    const pointsEl = row.querySelector(".points-cell");
    const letterEl = row.querySelector(".grade-pill");

    if (rawValue === "") {
      scoreInput.classList.remove("input-error");
      pointsEl.textContent = "—";
      letterEl.textContent = "—";
      letterEl.className = "grade-pill";
      return;
    }

    const score = parseInt(rawValue, 10);

    if (isNaN(score) || score < 0 || score > 100) {
      scoreInput.classList.add("input-error");
      pointsEl.textContent = "خطأ";
      letterEl.textContent = "—";
      letterEl.className = "grade-pill fail";
      return;
    }

    scoreInput.classList.remove("input-error");
    const result = convertScore(score);

    pointsEl.textContent = result.points.toFixed(2);
    letterEl.textContent = result.letter;
    letterEl.className = `grade-pill ${result.style}`;

    totalCredits += credits;
    totalPoints += result.points * credits;
    validCourses += 1;
  });

  if (validCourses === 0 || totalCredits === 0) {
    totalGpaEl.textContent = "0.00";
    coursesCountEl.textContent = "0";
    totalCreditsEl.textContent = "0";
    totalPointsEl.textContent = "0.00";
    overallRatingEl.textContent = "بانتظار إدخال الدرجات";
    overallRatingEl.className = "rating-pill";
    gpaProgressBar.style.width = "0%";
    return;
  }

  const gpa = totalPoints / totalCredits;
  const rating = getOverallRating(gpa);

  totalGpaEl.textContent = gpa.toFixed(2);
  coursesCountEl.textContent = validCourses;
  totalCreditsEl.textContent = totalCredits;
  totalPointsEl.textContent = totalPoints.toFixed(2);

  overallRatingEl.textContent = rating.text;
  overallRatingEl.className = `rating-pill ${rating.cssClass}`;
  gpaProgressBar.style.width = `${Math.min(100, (gpa / 4) * 100)}%`;
}

/**
 * تعبئة مثال تجريبي بمقررات وساعات ودرجات صحيحة
 */
function loadSampleData() {
  coursesBody.innerHTML = "";
  addCourseRow("برمجة متقدمة", 3, 98);
  addCourseRow("قواعد بيانات", 3, 91);
  addCourseRow("شبكات الحاسوب", 3, 84);
  addCourseRow("لغة إنجليزية تقنية", 2, 95);
  addCourseRow("هندسة برمجيات", 3, 77);
  addCourseRow("مهارات التواصل", 2, 88);
  calculateGPA();
}

// ربط أزرار التحكم
addCourseBtn.addEventListener("click", () => addCourseRow());
loadSampleBtn.addEventListener("click", loadSampleData);
resetBtn.addEventListener("click", () => {
  coursesBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    addCourseRow();
  }
  calculateGPA();
});

// تهيئة أولية بـ 5 صفوف فارغة عند فتح التطبيق
for (let i = 0; i < 5; i++) {
  addCourseRow();
}
