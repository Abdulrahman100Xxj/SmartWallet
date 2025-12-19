// DOM Elements
const addBtn = document.getElementById("addBtn");
const tbody = document.querySelector("#expenseTable tbody");
const salaryInput = document.getElementById("salary");
const summaryDiv = document.getElementById("summary");

const category = document.getElementById("category");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const period = document.getElementById("period");

// إضافة مصروف
addBtn.addEventListener("click", () => {
  const expense = {
    category: category.value,
    description: description.value.trim(),
    amount: Number(amount.value),
    period: period.value,
    createdAt: Date.now()
  };

  if (!expense.description || expense.amount <= 0) {
    alert("أدخل بيانات صحيحة");
    return;
  }

  db.ref("expenses").push(expense);

  description.value = "";
  amount.value = "";
});

// تحميل وعرض المصروفات
db.ref("expenses").on("value", snapshot => {
  tbody.innerHTML = "";
  let daily = 0, weekly = 0, monthly = 0;

  snapshot.forEach(child => {
    const id = child.key;
    const exp = child.val();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable="true">${exp.category}</td>
      <td contenteditable="true">${exp.description}</td>
      <td contenteditable="true">${exp.amount}</td>
      <td contenteditable="true">${exp.period}</td>
      <td>
        <button onclick="saveExpense('${id}', this)">حفظ</button>
        <button onclick="deleteExpense('${id}')">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);

    if (exp.period === "يومي") daily += exp.amount;
    if (exp.period === "أسبوعي") weekly += exp.amount;
    if (exp.period === "شهري") monthly += exp.amount;
  });

  updateSummary(daily, weekly, monthly);
});

// حفظ تعديل
function saveExpense(id, btn) {
  const row = btn.closest("tr");
  const updated = {
    category: row.cells[0].innerText,
    description: row.cells[1].innerText,
    amount: Number(row.cells[2].innerText),
    period: row.cells[3].innerText
  };
  if (!updated.description || updated.amount <= 0) return alert("بيانات غير صحيحة");

  db.ref("expenses/" + id).update(updated);
}

// حذف مصروف
function deleteExpense(id) {
  if (confirm("هل أنت متأكد؟")) {
    db.ref("expenses/" + id).remove();
  }
}

// تحديث الملخص
function updateSummary(d, w, m) {
  const salary = Number(salaryInput.value) || 0;
  const totalMonthly = d*30 + w*4 + m;

  summaryDiv.innerHTML = `
    <h3>ملخص الميزانية</h3>
    <p>الإجمالي الشهري: ${totalMonthly}</p>
    <p>المتبقي: ${salary - totalMonthly}</p>
  `;
}
