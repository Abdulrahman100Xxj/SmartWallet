// Firebase config (v9 compat)
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const dateInput = document.getElementById("selectedDate");
const itemName = document.getElementById("itemName");
const itemQty = document.getElementById("itemQty");
const itemAmount = document.getElementById("itemAmount");
const table = document.getElementById("itemsTable");
const addBtn = document.getElementById("addItemBtn");
const sendToWalletBtn = document.getElementById("sendToWallet");
const weekView = document.getElementById("weekView");

let plans = {};

// Load data
db.ref('plans').on('value', snapshot => {
  plans = snapshot.val() || {};
  renderTable();
  renderWeek();
});

// Add item
addBtn.addEventListener('click', () => {
  const date = dateInput.value;
  const name = itemName.value.trim();
  const qty = Number(itemQty.value) || 1;
  const amount = Number(itemAmount.value);

  if (!name || amount < 0) {
    alert("الرجاء إدخال اسم الغرض والمبلغ");
    return;
  }

  if (!plans[date]) plans[date] = [];
  plans[date].push({ name, qty, amount });
  db.ref('plans/' + date).set(plans[date]);

  itemName.value = "";
  itemQty.value = "";
  itemAmount.value = "";
});

// Render table
function renderTable() {
  table.innerHTML = "";
  const date = dateInput.value;
  if (!plans[date]) return;

  plans[date].forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.amount}</td>
      <td>
        <button onclick="toggleEdit(this, ${index})">تعديل</button>
        <button onclick="deleteItem(${index})">حذف</button>
      </td>
    `;
    table.appendChild(row);
  });
}

// Edit / Save
function toggleEdit(button, index) {
  const row = button.parentElement.parentElement;
  const date = dateInput.value;

  if (button.textContent === "تعديل") {
    row.cells[0].innerHTML = `<input type="text" value="${plans[date][index].name}">`;
    row.cells[1].innerHTML = `<input type="number" value="${plans[date][index].qty}">`;
    row.cells[2].innerHTML = `<input type="number" value="${plans[date][index].amount}">`;
    button.textContent = "حفظ";
  } else {
    const newName = row.cells[0].querySelector("input").value.trim();
    const newQty = Number(row.cells[1].querySelector("input").value);
    const newAmount = Number(row.cells[2].querySelector("input").value);

    if (!newName || newAmount < 0 || newQty <= 0) {
      alert("الرجاء إدخال بيانات صحيحة");
      return;
    }

    plans[date][index] = { name: newName, qty: newQty, amount: newAmount };
    db.ref('plans/' + date).set(plans[date]);
  }
}

// Delete item
function deleteItem(index) {
  const date = dateInput.value;
  plans[date].splice(index, 1);
  db.ref('plans/' + date).set(plans[date]);
}

// Send to wallet
sendToWalletBtn.addEventListener('click', () => {
  const date = dateInput.value;
  if (!plans[date] || plans[date].length === 0) {
    alert("لا توجد مشتريات لهذا اليوم");
    return;
  }

  let total = 0;
  plans[date].forEach(item => total += item.qty * item.amount);

  db.ref('walletExpenses/' + date).set({
    category: "مشتريات",
    description: `مشتريات يوم ${date}`,
    amount: total,
    period: "يومي"
  });

  alert("تمت إضافة مشتريات اليوم إلى الميزانية ✔");
});

// Render weekly summary
function renderWeek() {
  weekView.innerHTML = "";
  const startDate = new Date(dateInput.value);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    let total = 0;
    if (plans[dateStr]) plans[dateStr].forEach(item => total += item.qty * item.amount);

    const box = document.createElement("div");
    box.innerHTML = `<strong>${dateStr}</strong><br>إجمالي المشتريات: ${total.toFixed(2)}`;
    weekView.appendChild(box);
  }
}

// Load initial date
dateInput.valueAsDate = new Date();
