let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];

function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

function updateFoodDropdown() {
  const foodSelect = document.getElementById('foodSelect');
  foodSelect.innerHTML = '<option value="">Select Item</option>';
  foodDatabase.forEach(food => {
    const option = document.createElement('option');
    option.value = food.name;
    option.textContent = food.name;
    foodSelect.appendChild(option);
  });
}

function updateTable() {
  const logBody = document.getElementById('logBody');
  const totalCaloriesEl = document.getElementById('totalCalories');
  const totalProteinEl = document.getElementById('totalProtein');
  const remainingCaloriesEl = document.getElementById('remainingCalories');
  const remainingProteinEl = document.getElementById('remainingProtein');

  logBody.innerHTML = '';
  let totalCal = 0;
  let totalPro = 0;

  foodLog.forEach((item, index) => {
    const row = document.createElement('tr');
    const cal = item.calories * item.qty;
    const pro = item.protein * item.qty;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${cal}</td>
      <td>${pro}</td>
      <td>${item.qty}</td>
      <td><button onclick="removeLogEntry(${index})">X</button></td>
    `;
    logBody.appendChild(row);

    totalCal += cal;
    totalPro += pro;
  });

  totalCaloriesEl.textContent = totalCal;
  totalProteinEl.textContent = totalPro;

  const calorieGoal = parseFloat(document.getElementById('calorieGoal').value) || 0;
  const proteinGoal = parseFloat(document.getElementById('proteinGoal').value) || 0;

  remainingCaloriesEl.textContent = Math.max(calorieGoal - totalCal, 0);
  remainingProteinEl.textContent = Math.max(proteinGoal - totalPro, 0);
}

function addEntry() {
  const name = document.getElementById('foodSelect').value;
  const qty = parseInt(document.getElementById('quantity').value);
  const food = foodDatabase.find(f => f.name === name);

  if (!food || isNaN(qty)) {
    alert('Please select a valid food and quantity.');
    return;
  }

  foodLog.push({ name: food.name, calories: food.calories, protein: food.protein, qty });
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
  document.getElementById('quantity').value = 1;
}

function removeLogEntry(index) {
  foodLog.splice(index, 1);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
}

function resetLog() {
  if (confirm('Clear your log?')) {
    foodLog = [];
    localStorage.removeItem('foodLog');
    updateTable();
  }
}

function addFoodAndReturn() {
  const name = document.getElementById('newFoodName').value.trim();
  const calories = parseFloat(document.getElementById('newCalories').value);
  const protein = parseFloat(document.getElementById('newProtein').value);

  if (!name || isNaN(calories) || isNaN(protein)) {
    alert('Please complete all fields.');
    return;
  }

  foodDatabase.push({ name, calories, protein });
  localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));

  document.getElementById('newFoodName').value = '';
  document.getElementById('newCalories').value = '';
  document.getElementById('newProtein').value = '';

  updateFoodDropdown();
  updateFoodTable();
  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
}

function updateFoodTable() {
  const body = document.getElementById('foodDatabaseBody');
  body.innerHTML = '';
  foodDatabase.forEach((food, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td><button onclick="deleteFood(${index})">Delete</button></td>
    `;
    body.appendChild(row);
  });
}

function deleteFood(index) {
  foodDatabase.splice(index, 1);
  localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
  updateFoodDropdown();
  updateFoodTable();
}

async function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  await html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (decodedText) => {
      html5QrCode.stop();
      fetchFoodFromBarcode(decodedText);
    }
  );
}

async function fetchFoodFromBarcode(barcode) {
  const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  const data = await response.json();

  if (data.status === 1) {
    const product = data.product;
    document.getElementById('newFoodName').value = product.product_name || '';
    document.getElementById('newCalories').value = product.nutriments["energy-kcal_100g"] || '';
    document.getElementById('newProtein').value = product.nutriments.proteins_100g || '';
  } else {
    alert("Food not found. Please enter manually.");
  }
}

document.getElementById('calorieGoal').addEventListener('input', updateTable);
document.getElementById('proteinGoal').addEventListener('input', updateTable);

updateFoodDropdown();
updateFoodTable();
updateTable();
