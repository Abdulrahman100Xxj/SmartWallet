// DOM Elements
const dateInput = document.getElementById("selectedDate");
const itemName = document.getElementById("itemName");
const itemQty = document.getElementById("itemQty");
const itemAmount = document.getElementById("itemAmount");
const addItemBtn = document.getElementById("addItemBtn");
const tableBody = document.querySelector("#itemsTable tbody");

// إضافة غرض
addItemBtn.addEventListener("click", () => {
  const date = dateInput.value;
  const item = {
    name: itemName.value.trim(),
    qty: Number(itemQty.value),
    amount: Number(itemAmount.value),
    createdAt: Date.now()
  };

  if (!date || !item.name || item.amount <= 0) return alert("بيانات غير صحيحة");

  db.ref("shoppingPlans/" + date).push(item);

  itemName.value = "";
  itemQty.value = "";
  itemAmount.value = "";
});

// تحميل وعرض
db.ref("shoppingPlans").on("value", snapshot => {
  tableBody.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  Object.keys(data).forEach(date => {
    Object.keys(data[date]).forEach(id => {
      const it = data[date][id];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${date}</td>
        <td contenteditable="true">${it.name}</td>
        <td contenteditable="true">${it.qty}</td>
        <td contenteditable="true">${it.amount}</td>
        <td>
          <button onclick="saveItem('${date}','${id}', this)">حفظ</button>
          <button onclick="deleteItem('${date}','${id}')">حذف</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  });
});

// حفظ تعديل
function saveItem(date, id, btn){
  const row = btn.closest("tr");
  const updated = {
    name: row.cells[1].innerText,
    qty: Number(row.cells[2].innerText),
    amount: Number(row.cells[3].innerText)
  };
  if(!updated.name || updated.amount <= 0) return alert("بيانات غير صحيحة");

  db.ref(`shoppingPlans/${date}/${id}`).update(updated);
}

// حذف
function deleteItem(date,id){
  if(confirm("حذف الغرض؟")){
    db.ref(`shoppingPlans/${date}/${id}`).remove();
  }
}
