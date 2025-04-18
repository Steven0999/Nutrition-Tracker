let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
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

function searchFood() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';

  if (!input) return;

  const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(input));

  if (matches.length > 0) {
    matches.forEach(food => {
      const div = document.createElement('div');
      div.textContent = food.name;
      div.style.cursor = "pointer";
      div.style.padding = "5px 0";
      div.onclick = () => {
        document.getElementById('searchInput').value = food.name;
        resultsDiv.innerHTML = '';
      };
      resultsDiv.appendChild(div);
    });
  } else if (input.length >= 3) {
    const addOption = document.createElement('div');
    addOption.innerHTML = `<strong>Food not found:</strong> Click to add "<em>${input}</em>"`;
    addOption.style.cursor = "pointer";
    addOption.style.color = "#007BFF";
    addOption.style.padding = "5px 0";
    addOption.onclick = () => {
      document.getElementById('newFoodName').value = input;
      switchTab({ target: document.querySelectorAll('.tab-btn')[1] }, 'createTab');
    };
    resultsDiv.appendChild(addOption);
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
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

/*function updateTable() {
  const logBody = document.getElementById('logBody');
  logBody.innerHTML = '';

  const addedMeals = new Set();
  let totalCal = 0;
  let totalPro = 0;

  foodLog.forEach((item, index) => {
    if (!addedMeals.has(item.meal)) {
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="6" class="meal-header">${item.meal}</td>`;
      logBody.appendChild(headerRow);
      addedMeals.add(item.meal);
    }

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

  document.getElementById('goalCalories').textContent = goals.calories;
  document.getElementById('goalProtein').textContent = goals.protein;
  document.getElementById('totalCalories').textContent = totalCal.toFixed(1);
  document.getElementById('totalProtein').textContent = totalPro.toFixed(1);
  document.getElementById('remainingCalories').textContent = Math.max(goals.calories - totalCal, 0).toFixed(1);
  document.getElementById('remainingProtein').textContent = Math.max(goals.protein - totalPro, 0).toFixed(1);
}*/

function updateTable() {
  const logBody = document.getElementById('logBody');
  logBody.innerHTML = '';

  const mealGroups = {
    Breakfast: [],
    Lunch: [],
    Dinner: []
  };

  // Group entries
  foodLog.forEach(entry => {
    if (!mealGroups[entry.meal]) mealGroups[entry.meal] = [];
    mealGroups[entry.meal].push(entry);
  });

  let totalCal = 0;
  let totalPro = 0;

  Object.keys(mealGroups).forEach(meal => {
    const entries = mealGroups[meal];
    if (entries.length === 0) return;

    let mealCal = 0;
    let mealPro = 0;

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<td colspan="6" class="meal-header">${meal}</td>`;
    logBody.appendChild(headerRow);

    entries.forEach((item, index) => {
      const cal = item.calories * item.qty;
      const pro = item.protein * item.qty;

      mealCal += cal;
      mealPro += pro;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.meal}</td>
        <td>${cal.toFixed(1)}</td>
        <td>${pro.toFixed(1)}</td>
        <td>${item.qty}</td>
        <td><button onclick="removeLogEntry(${foodLog.indexOf(item)})">X</button></td>
      `;
      logBody.appendChild(row);
    });

    // Total for the meal
    const totalRow = document.createElement('tr');
    totalRow.classList.add('meal-total');
    totalRow.innerHTML = `
      <td colspan="2"><strong>${meal} Total</strong></td>
      <td><strong>${mealCal.toFixed(1)}</strong></td>
      <td><strong>${mealPro.toFixed(1)}</strong></td>
      <td colspan="2"></td>
    `;
    logBody.appendChild(totalRow);

    totalCal += mealCal;
    totalPro += mealPro;
  });

  // Update overall totals
  document.getElementById('goalCalories').textContent = goals.calories;
  document.getElementById('goalProtein').textContent = goals.protein;
  document.getElementById('totalCalories').textContent = totalCal.toFixed(1);
  document.getElementById('totalProtein').textContent = totalPro.toFixed(1);
  document.getElementById('remainingCalories').textContent = Math.max(goals.calories - totalCal, 0).toFixed(1);
  document.getElementById('remainingProtein').textContent = Math.max(goals.protein - totalPro, 0).toFixed(1);
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

  updateFoodTable();
  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
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

function updateFoodTable() {
  const body = document.getElementById('foodDatabaseBody');
  body.innerHTML = '';
  foodDatabase.forEach((food, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td>
        <button onclick="editFood(${index})">Edit</button>
        <button onclick="deleteFood(${index})">Delete</button>
      </td>
    `;
    body.appendChild(row);
  });
}

function searchDatabase() {
  const input = document.getElementById('databaseSearchInput').value.toLowerCase();
  const body = document.getElementById('foodDatabaseBody');
  body.innerHTML = '';

  const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(input));
  matches.forEach((food, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td>
        <button onclick="editFood(${index})">Edit</button>
        <button onclick="deleteFood(${index})">Delete</button>
      </td>
    `;
    body.appendChild(row);
  });
}

function editFood(index) {
  const food = foodDatabase[index];
  const name = prompt("Edit name:", food.name);
  const calories = parseFloat(prompt("Edit calories:", food.calories));
  const protein = parseFloat(prompt("Edit protein:", food.protein));

  if (name && !isNaN(calories) && !isNaN(protein)) {
    foodDatabase[index] = { name, calories, protein };
    localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
    updateFoodTable();
  }
}

function deleteFood(index) {
  foodDatabase.splice(index, 1);
  localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
  updateFoodTable();
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

// Init
updateTable();
updateFoodTable();
