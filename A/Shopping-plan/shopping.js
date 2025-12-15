// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; 

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwo1gaDW94XSxy2Ut3_G_nj5fCIb3d0oY",
  authDomain: "smartwallet-10702.firebaseapp.com",
  projectId: "smartwallet-10702",
  storageBucket: "smartwallet-10702.appspot.com",
  messagingSenderId: "82577266544",
  appId: "1:82577266544:web:8dc16650691408d25ee1b5",
  measurementId: "G-GZCZ2NVPP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const dateInput = document.getElementById("selectedDate");
const itemName = document.getElementById("itemName");
const itemQty = document.getElementById("itemQty");
const itemAmount = document.getElementById("itemAmount");
const table = document.getElementById("itemsTable");
const dayTotal = document.getElementById("dayTotal");
const addBtn = document.getElementById("addItemBtn");
const sendToWalletBtn = document.getElementById("sendToWallet");
const weekView = document.getElementById("weekView");

let plans = {};

// Set today as default
dateInput.valueAsDate = new Date();

// Events
addBtn.addEventListener("click", addItem);
dateInput.addEventListener("change", () => {
  loadPlans(dateInput.value);
});
sendToWalletBtn.addEventListener("click", sendToWallet);

// Load data for selected date
async function loadPlans(date) {
  const docRef = doc(db, "plans", date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    plans[date] = docSnap.data().items || [];
  } else {
    plans[date] = [];
  }

  renderTable();
  renderWeek();
}

// Save data to Firebase
async function savePlans(date) {
  const docRef = doc(db, "plans", date);
  await setDoc(docRef, { items: plans[date] });
}

// Add new item
async function addItem() {
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

  await savePlans(date);

  itemName.value = "";
  itemQty.value = "";
  itemAmount.value = "";

  renderTable();
  renderWeek();
}

// Render table for the selected date
function renderTable() {
  const date = dateInput.value;
  table.innerHTML = "";
  let total = 0;

  if (!plans[date]) {
    dayTotal.textContent = "0";
    return;
  }

  plans[date].forEach((item, index) => {
    total += item.qty * item.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td contenteditable="false">${item.name}</td>
      <td contenteditable="false">${item.qty}</td>
      <td contenteditable="false">${item.amount}</td>
      <td>
        <button onclick="toggleEdit(${index}, this)">تعديل</button>
        <button onclick="deleteItem(${index})">حذف</button>
      </td>
    `;
    table.appendChild(row);
  });

  dayTotal.textContent = total.toFixed(2);
}

// Edit / Save item
async function toggleEdit(index, btn) {
  const row = table.rows[index];
  const date = dateInput.value;

  if (btn.textContent === "تعديل") {
    row.cells[0].contentEditable = true;
    row.cells[1].contentEditable = true;
    row.cells[2].contentEditable = true;
    btn.textContent = "حفظ";
  } else {
    plans[date][index] = {
      name: row.cells[0].innerText.trim(),
      qty: Number(row.cells[1].innerText) || 1,
      amount: Number(row.cells[2].innerText) || 0
    };

    row.cells[0].contentEditable = false;
    row.cells[1].contentEditable = false;
    row.cells[2].contentEditable = false;

    btn.textContent = "تعديل";
    await savePlans(date);
    renderTable();
    renderWeek();
  }
}

// Delete item
async function deleteItem(index) {
  const date = dateInput.value;
  plans[date].splice(index, 1);
  await savePlans(date);
  renderTable();
  renderWeek();
}

// Send today purchases to wallet
async function sendToWallet() {
  const date = dateInput.value;
  if (!plans[date] || plans[date].length === 0) {
    alert("لا توجد مشتريات لهذا اليوم");
    return;
  }

  let total = 0;
  plans[date].forEach(item => total += item.qty * item.amount);

  const docRef = doc(db, "walletExpenses", date);
  await setDoc(docRef, {
    category: "مشتريات",
    description: `مشتريات يوم ${date}`,
    amount: total,
    period: "يومي"
  });

  alert("تمت إضافة مشتريات اليوم إلى الميزانية ✔");
}

// Render weekly summary
function renderWeek() {
  const startDate = new Date(dateInput.value);
  weekView.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    let total = 0;
    if (plans[dateStr]) {
      plans[dateStr].forEach(item => total += item.qty * item.amount);
    }

    const box = document.createElement("div");
    box.style.background = "#eaf4ff";
    box.style.padding = "10px";
    box.style.margin = "6px 0";
    box.style.borderRadius = "8px";

    box.innerHTML = `<strong>${dateStr}</strong><br>إجمالي المشتريات: ${total.toFixed(2)}`;
    weekView.appendChild(box);
  }
}

// Initial load
loadPlans(dateInput.value);
