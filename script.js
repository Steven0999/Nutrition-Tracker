/*let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];

let goals = {
  calories: parseInt(localStorage.getItem('goalCalories')) || 0,
  protein: parseInt(localStorage.getItem('goalProtein')) || 0
};

function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

function updateFoodDropdown() {
  const search = document.getElementById('searchInput');
  search.value = '';
  document.getElementById('searchResults').innerHTML = '';
}

function searchFood() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';

  const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(input));

  if (matches.length) {
    matches.forEach(food => {
      const div = document.createElement('div');
      div.textContent = food.name;
      div.onclick = () => {
        document.getElementById('searchInput').value = food.name;
        resultsDiv.innerHTML = '';
      };
      resultsDiv.appendChild(div);
    });
  } else if (input.length > 2) {
    const div = document.createElement('div');
    div.textContent = `Food not found. Click to create "${input}"`;
    div.onclick = () => {
      document.getElementById('newFoodName').value = input;
      switchTab({ target: document.querySelectorAll('.tab-btn')[1] }, 'createTab');
    };
    resultsDiv.appendChild(div);
  }
}

function toggleCustomWeight() {
  const type = document.getElementById('servingType').value;
  document.getElementById('customWeight').style.display = type === 'custom' ? 'inline-block' : 'none';
}

function addEntry() {
  const name = document.getElementById('searchInput').value.trim();
  const qty = parseInt(document.getElementById('quantity').value);
  const meal = document.getElementById('mealType').value;
  const type = document.getElementById('servingType').value;
  const customWeight = parseFloat(document.getElementById('customWeight').value);

  const food = foodDatabase.find(f => f.name.toLowerCase() === name.toLowerCase());

  if (!food || isNaN(qty)) {
    alert('Please select a valid food and quantity.');
    return;
  }

  let cal = food.calories;
  let pro = food.protein;

  if (type === 'custom') {
    if (isNaN(customWeight)) return alert("Enter valid weight");
    cal = (cal / 100) * customWeight;
    pro = (pro / 100) * customWeight;
  }

  foodLog.push({ name: food.name, calories: cal, protein: pro, qty, meal });
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
  document.getElementById('quantity').value = 1;
  updateFoodDropdown();
}

function updateTable() {
  const logBody = document.getElementById('logBody');
  const goalCaloriesEl = document.getElementById('goalCalories');
  const goalProteinEl = document.getElementById('goalProtein');
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
      <td>${item.meal}</td>
      <td>${cal.toFixed(1)}</td>
      <td>${pro.toFixed(1)}</td>
      <td>${item.qty}</td>
      <td><button onclick="removeLogEntry(${index})">X</button></td>
    `;
    logBody.appendChild(row);

    totalCal += cal;
    totalPro += pro;
  });

  goalCaloriesEl.textContent = goals.calories;
  goalProteinEl.textContent = goals.protein;
  totalCaloriesEl.textContent = totalCal.toFixed(1);
  totalProteinEl.textContent = totalPro.toFixed(1);
  remainingCaloriesEl.textContent = Math.max(goals.calories - totalCal, 0).toFixed(1);
  remainingProteinEl.textContent = Math.max(goals.protein - totalPro, 0).toFixed(1);
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

function saveGoals() {
  const calInput = parseInt(document.getElementById('goalCaloriesInput').value);
  const proInput = parseInt(document.getElementById('goalProteinInput').value);

  if (!isNaN(calInput)) {
    goals.calories = calInput;
    localStorage.setItem('goalCalories', calInput);
  }
  if (!isNaN(proInput)) {
    goals.protein = proInput;
    localStorage.setItem('goalProtein', proInput);
  }

  alert("Goals saved!");
  updateTable();
  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
}

function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
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

updateFoodDropdown();
updateFoodTable();
updateTable();*/

let foodLog = JSON.parse(localStorage.getItem('foodLog')) || []; 
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];

let goals = { 
  calories: parseInt(localStorage.getItem('goalCalories')) || 0, protein: parseInt(localStorage.getItem('goalProtein')) || 0 
};

function switchTab(event, tabId) { 
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); 
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); 
  document.getElementById(tabId).classList.add('active'); event.target.classList.add('active'); 
}

function searchFood() { 
  const input = document.getElementById('searchInput').value.toLowerCase(); 
  const resultsDiv = document.getElementById('searchResults'); resultsDiv.innerHTML = '';
  const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(input));

if (matches.length) { matches.forEach(food => { const div = document.createElement('div'); div.textContent = food.name; div.onclick = () => { 
  document.getElementById('searchInput').value = food.name; resultsDiv.innerHTML = ''; 
}; 
                resultsDiv.appendChild(div); }); } else if (input.length > 2) { const div = document.createElement('div'); div.textContent = Food not found. Click to create "${input}"; div.onclick = () => { document.getElementById('newFoodName').value = input; switchTab({ target: document.querySelectorAll('.tab-btn')[1] }, 'createTab'); }; resultsDiv.appendChild(div); } }

function toggleCustomWeight() { const type = document.getElementById('servingType').value; document.getElementById('customWeight').style.display = type === 'custom' ? 'inline-block' : 'none'; }

function addEntry() { const name = document.getElementById('searchInput').value.trim(); const qty = parseInt(document.getElementById('quantity').value); const meal = document.getElementById('mealType').value; const type = document.getElementById('servingType').value; const customWeight = parseFloat(document.getElementById('customWeight').value);

const food = foodDatabase.find(f => f.name.toLowerCase() === name.toLowerCase()); if (!food || isNaN(qty)) return alert('Select valid food and quantity');

let cal = food.calories; let pro = food.protein; if (type === 'custom') { if (isNaN(customWeight)) return alert("Enter valid weight"); cal = (cal / 100) * customWeight; pro = (pro / 100) * customWeight; }

foodLog.push({ name: food.name, calories: cal, protein: pro, qty, meal }); localStorage.setItem('foodLog', JSON.stringify(foodLog)); updateLogDisplay(); document.getElementById('quantity').value = 1; }

function updateLogDisplay() { const container = document.getElementById('logContainer'); container.innerHTML = '';

const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack']; let totalCal = 0, totalPro = 0;

meals.forEach(meal => { const entries = foodLog.filter(entry => entry.meal === meal); if (!entries.length) return;

const section = document.createElement('div');
section.classList.add('meal-section');

const header = document.createElement('div');
header.className = 'meal-header';
header.textContent = meal;
section.appendChild(header);

const table = document.createElement('table');
table.className = 'meal-table';

const thead = document.createElement('thead');
thead.innerHTML = `<tr><th>Food</th><th>Calories</th><th>Protein</th><th>Qty</th><th>Remove</th></tr>`;
table.appendChild(thead);

const tbody = document.createElement('tbody');

entries.forEach((entry, index) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${entry.name}</td>
    <td>${entry.calories * entry.qty}</td>
    <td>${entry.protein * entry.qty}</td>
    <td>${entry.qty}</td>
    <td><button onclick="removeEntry('${meal}', ${index})">X</button></td>
  `;
  tbody.appendChild(row);

  totalCal += entry.calories * entry.qty;
  totalPro += entry.protein * entry.qty;
});

table.appendChild(tbody);
section.appendChild(table);
container.appendChild(section);

});

document.getElementById('totalCalories').textContent = totalCal; document.getElementById('totalProtein').textContent = totalPro; document.getElementById('goalCalories').textContent = goals.calories; document.getElementById('goalProtein').textContent = goals.protein; document.getElementById('remainingCalories').textContent = goals.calories - totalCal; document.getElementById('remainingProtein').textContent = goals.protein - totalPro; }

function removeEntry(meal, indexToRemove) { let mealEntries = foodLog.filter(entry => entry.meal === meal); mealEntries.splice(indexToRemove, 1); foodLog = foodLog.filter(entry => entry.meal !== meal).concat(mealEntries); localStorage.setItem('foodLog', JSON.stringify(foodLog)); updateLogDisplay(); }

function resetLog() { if (confirm('Clear all entries?')) { localStorage.removeItem('foodLog'); foodLog = []; updateLogDisplay(); } }

function addFoodAndReturn() { const name = document.getElementById('newFoodName').value.trim(); const calories = parseFloat(document.getElementById('newCalories').value); const protein = parseFloat(document.getElementById('newProtein').value);

if (!name || isNaN(calories) || isNaN(protein)) { return alert('Please enter valid food data.'); }

foodDatabase.push({ name, calories, protein }); localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase)); document.getElementById('newFoodName').value = ''; document.getElementById('newCalories').value = ''; document.getElementById('newProtein').value = ''; switchTab({ target: document.querySelectorAll('.tab-btn')[0] }, 'trackerTab'); updateLogDisplay(); }

function saveGoals() { goals.calories = parseInt(document.getElementById('goalCaloriesInput').value) || 0; goals.protein = parseInt(document.getElementById('goalProteinInput').value) || 0; localStorage.setItem('goalCalories', goals.calories); localStorage.setItem('goalProtein', goals.protein); updateLogDisplay(); }

window.onload = () => { updateLogDisplay(); const dbBody = document.getElementById('foodDatabaseBody'); foodDatabase.forEach((food, index) => { const row = document.createElement('tr'); row.innerHTML = <td>${food.name}</td><td>${food.calories}</td><td>${food.protein}</td><td><button onclick="deleteFood(${index})">Delete</button></td>; dbBody.appendChild(row); }); };

function deleteFood(index) { foodDatabase.splice(index, 1); localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase)); location.reload(); }


