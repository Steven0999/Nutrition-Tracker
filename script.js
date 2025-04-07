const foodInput = document.getElementById('food');
const calInput = document.getElementById('calories');
const proteinInput = document.getElementById('protein');
const qtyInput = document.getElementById('quantity');
const logBody = document.getElementById('logBody');
const totalCalories = document.getElementById('totalCalories');
const totalProtein = document.getElementById('totalProtein');

let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];

function updateTable() {
  logBody.innerHTML = '';
  let totalCal = 0;
  let totalPro = 0;

  foodLog.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.calories * item.qty}</td>
      <td>${item.protein * item.qty}</td>
      <td>${item.qty}</td>
    `;
    logBody.appendChild(row);
    totalCal += item.calories * item.qty;
    totalPro += item.protein * item.qty;
  });

  totalCalories.textContent = totalCal;
  totalProtein.textContent = totalPro;
}

function addEntry() {
  const name = foodInput.value.trim();
  const calories = parseFloat(calInput.value);
  const protein = parseFloat(proteinInput.value);
  const qty = parseInt(qtyInput.value);

  if (!name || isNaN(calories) || isNaN(protein) || isNaN(qty)) {
    alert('Please fill out all fields correctly.');
    return;
  }

  foodLog.push({ name, calories, protein, qty });
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();

  foodInput.value = '';
  calInput.value = '';
  proteinInput.value = '';
  qtyInput.value = 1;
}

function resetLog() {
  if (confirm('Are you sure you want to reset the log?')) {
    foodLog = [];
    localStorage.removeItem('foodLog');
    updateTable();
  }
}

updateTable(); // Load data on page load
