// تأكد من إضافة هذه السكربتات في HTML قبل هذا الكود
/*
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js"></script>
*/

const firebaseConfig = {
  apiKey: "AIzaSyAwo1gaDW94XSxy2Ut3_G_nj5fCIb3d0oY",
  authDomain: "smartwallet-10702.firebaseapp.com",
  databaseURL: "https://smartwallet-10702-default-rtdb.firebaseio.com",
  projectId: "smartwallet-10702",
  storageBucket: "smartwallet-10702.appspot.com",
  messagingSenderId: "82577266544",
  appId: "1:82577266544:web:8dc16650691408d25ee1b5",
  measurementId: "G-GZCZ2NVPP8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const addBtn = document.getElementById('addBtn');
const filterPeriod = document.getElementById('filterPeriod');
const filterCategory = document.getElementById('filterCategory');
const salaryInput = document.getElementById('salary');
const tbody = document.getElementById('expenseTable').querySelector('tbody');
const summaryDiv = document.getElementById('summary');

let expenses = [];

// Load data from Firebase on start
function loadExpenses() {
    db.ref('expenses').once('value', snapshot => {
        expenses = snapshot.val() || [];
        renderTable();
        updateSummary();
    });
}

// Save data to Firebase
function saveExpenses() {
    db.ref('expenses').set(expenses);
}

// Add new expense
addBtn.addEventListener('click', () => {
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const period = document.getElementById('period').value;

    if (!description || !amount || amount <= 0) {
        alert('الرجاء إدخال وصف ومبلغ صحيح');
        return;
    }

    expenses.push({ category, description, amount, period });
    saveExpenses();
    clearInputs();
    renderTable();
    updateSummary();
});

// Clear input fields
function clearInputs() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = 'ديون';
    document.getElementById('period').value = 'يومي';
}

// Render table with filters
function renderTable() {
    tbody.innerHTML = '';

    const periodFilter = filterPeriod.value;
    const categoryFilter = filterCategory.value;

    expenses.forEach((exp, index) => {
        if ((periodFilter === 'الكل' || exp.period === periodFilter) &&
            (categoryFilter === 'الكل' || exp.category === categoryFilter)) {

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exp.category}</td>
                <td>${exp.description}</td>
                <td>${exp.amount}</td>
                <td>${exp.period}</td>
                <td>
                    <button onclick="editRow(this, ${index})">تعديل</button>
                    <button onclick="deleteExpense(${index})">حذف</button>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

// Update summary
function updateSummary() {
    const salary = parseFloat(salaryInput.value) || 0;
    let daily = 0, weekly = 0, monthly = 0;

    expenses.forEach(exp => {
        if (exp.period === 'يومي') daily += exp.amount;
        else if (exp.period === 'أسبوعي') weekly += exp.amount;
        else if (exp.period === 'شهري') monthly += exp.amount;
    });

    const totalDaily = daily + weekly / 7 + monthly / 30;
    const totalWeekly = daily * 7 + weekly + monthly / 4;
    const totalMonthly = daily * 30 + weekly * 4 + monthly;
    const remaining = salary - totalMonthly;

    summaryDiv.innerHTML = `
        <h3>ملخص الميزانية</h3>
        <p>المجموع اليومي: ${totalDaily.toFixed(2)}</p>
        <p>المجموع الأسبوعي: ${totalWeekly.toFixed(2)}</p>
        <p>المجموع الشهري: ${totalMonthly.toFixed(2)}</p>
        <p>الرصيد المتبقي: ${remaining.toFixed(2)}</p>
    `;
}

// Delete expense
function deleteExpense(index) {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
        expenses.splice(index, 1);
        saveExpenses();
        renderTable();
        updateSummary();
    }
}

// Edit row inline
function editRow(button, index) {
    const row = button.parentElement.parentElement;
    if (button.textContent === 'تعديل') {
        row.cells[0].innerHTML = `<select>
            <option value="ديون" ${expenses[index].category === 'ديون' ? 'selected' : ''}>ديون</option>
            <option value="مشتريات" ${expenses[index].category === 'مشتريات' ? 'selected' : ''}>مشتريات</option>
            <option value="مستقبلي" ${expenses[index].category === 'مستقبلي' ? 'selected' : ''}>مستقبلي</option>
        </select>`;
        row.cells[1].innerHTML = `<input type="text" value="${expenses[index].description}">`;
        row.cells[2].innerHTML = `<input type="number" value="${expenses[index].amount}">`;
        row.cells[3].innerHTML = `<select>
            <option value="يومي" ${expenses[index].period === 'يومي' ? 'selected' : ''}>يومي</option>
            <option value="أسبوعي" ${expenses[index].period === 'أسبوعي' ? 'selected' : ''}>أسبوعي</option>
            <option value="شهري" ${expenses[index].period === 'شهري' ? 'selected' : ''}>شهري</option>
        </select>`;
        button.textContent = 'حفظ';
    } else {
        const newCategory = row.cells[0].querySelector('select').value;
        const newDescription = row.cells[1].querySelector('input').value.trim();
        const newAmount = parseFloat(row.cells[2].querySelector('input').value);
        const newPeriod = row.cells[3].querySelector('select').value;

        if (!newDescription || !newAmount || newAmount <= 0) {
            alert('الرجاء إدخال وصف ومبلغ صحيح');
            return;
        }

        expenses[index] = {
            category: newCategory,
            description: newDescription,
            amount: newAmount,
            period: newPeriod
        };

        saveExpenses();
        renderTable();
        updateSummary();
    }
}

// Filters
filterPeriod.addEventListener('change', renderTable);
filterCategory.addEventListener('change', renderTable);

// Initial load
loadExpenses();
