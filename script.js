let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];

const foodSelect = document.getElementById('foodSelect');
const qtyInput = document.getElementById('quantity');
const logBody = document.getElementById('logBody');
const totalCalories = document.getElementById('totalCalories');
const totalProtein = document.getElementById('totalProtein');
const foodDatabaseBody = document.getElementById('foodDatabaseBody');

function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

function updateFoodDropdown() {
  foodSelect.innerHTML = '<option value="">Select Item</option>';
  foodDatabase.forEach(food => {
    const option = document.createElement('option');
    option.value = food.name;
    option.textContent = food.name;
    foodSelect.appendChild(option);
  });
}

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
  const name = foodSelect.value;
  const qty = parseInt(qtyInput.value);
  const food = foodDatabase.find(f => f.name === name);

  if (!food || isNaN(qty)) {
    alert('Please select a valid food and quantity.');
    return;
  }

  foodLog.push({ name: food.name, calories: food.calories, protein: food.protein, qty });
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
  qtyInput.value = 1;
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

  const trackerBtn = document.querySelector('.tab-btn:nth-child(1)');
  switchTab({ target: trackerBtn }, 'trackerTab');
}

function updateFoodTable() {
  foodDatabaseBody.innerHTML = '';
  foodDatabase.forEach((food, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td><button onclick="deleteFood(${index})">Delete</button></td>
    `;
    foodDatabaseBody.appendChild(row);
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
  const config = { fps: 10, qrbox: 250 };
  await html5QrCode.start(
    { facingMode: "environment" },
    config,
    async (decodedText) => {
      html5QrCode.stop();
      fetchFoodFromBarcode(decodedText);
    },
    errorMessage => {}
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

updateFoodDropdown();
updateTable();
updateFoodTable();
