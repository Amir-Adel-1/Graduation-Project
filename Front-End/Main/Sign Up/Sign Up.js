// ملء القوائم الخاصة بتاريخ الميلاد
const daySelect = document.getElementById('day');
const monthSelect = document.getElementById('month');
const yearSelect = document.getElementById('year');

// الأيام
for (let d = 1; d <= 31; d++) {
  const option = document.createElement('option');
  option.value = d;
  option.textContent = d;
  daySelect.appendChild(option);
}

// الأشهر
const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
months.forEach((m, i) => {
  const option = document.createElement('option');
  option.value = i + 1;
  option.textContent = m;
  monthSelect.appendChild(option);
});

// السنوات
const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1900; y--) {
  const option = document.createElement('option');
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

// رسالة نجاح مؤقتة
const form = document.getElementById('signupForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  successMsg.textContent = "✅ تم إنشاء الحساب بنجاح!";
  form.reset();
  setTimeout(() => {
    successMsg.textContent = "";
  }, 3000);
});
