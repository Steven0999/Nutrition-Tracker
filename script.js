// Tab switching
function switchTab(tabId) {
  document.querySelectorAll('.tabContent').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}
switchTab('tracker'); // Default tab

let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];
let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || { calories: 0, protein: 0 };

function updateFoodSelect() {
  const select = document.getElementById('foodSelect');
  select.innerHTML = '<option disabled selected>Select Item</option>';
  foodDatabase.forEach((food, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = food.name;
    select.appendChild(option);
  });
}

function addFoodToDatabase() {
  const name = document.getElementById('foodName').value;
  const calories = parseInt(document.getElementById('foodCalories').value);
  const protein = parseInt(document.getElementById('foodProtein').value);

  if (name && calories && protein) {
    foodDatabase.push({ name, calories, protein });
    localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
    document.getElementById('foodName').value = '';
    document.getElementById('foodCalories').value = '';
    document.getElementById('foodProtein').value = '';
    updateFoodList();
    updateFoodSelect();
  }
}

function updateFoodList() {
  const list = document.getElementById('foodList');
  list.innerHTML = '';
  foodDatabase.forEach((food, index) => {
    const li = document.createElement('li');
    li.textContent = `${food.name} - ${food.calories} cal, ${food.protein}g`;
    const del = document.createElement('button');
    del.textContent = 'X';
    del.className = 'delete';
    del.onclick = () => {
      foodDatabase.splice(index, 1);
      localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
      updateFoodList();
      updateFoodSelect();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
}

function addFoodLog() {
  const select = document.getElementById('foodSelect');
  const quantity = parseInt(document.getElementById('quantity').value);
  const index = parseInt(select.value);

  if (!isNaN(index) && quantity > 0) {
    const food = foodDatabase[index];
    foodLog.push({
      name: food.name,
      calories: food.calories * quantity,
      protein: food.protein * quantity
    });
    localStorage.setItem('foodLog', JSON.stringify(foodLog));
    updateLogList();
    updateTotals();
  }
}

function updateLogList() {
  const list = document.getElementById('logList');
  list.innerHTML = '';
  foodLog.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.calories} cal, ${entry.protein}g`;
    const del = document.createElement('button');
    del.textContent = 'X';
    del.className = 'delete';
    del.onclick = () => {
      foodLog.splice(index, 1);
      localStorage.setItem('foodLog', JSON.stringify(foodLog));
      updateLogList();
      updateTotals();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
}

function saveGoals() {
  const cal = parseInt(document.getElementById('calorieGoalInput').value);
  const prot = parseInt(document.getElementById('proteinGoalInput').value);
  goals = { calories: cal || 0, protein: prot || 0 };
  localStorage.setItem('goals', JSON.stringify(goals));
  updateTotals();
  alert("Goals Saved!");
}

function updateTotals() {
  const totalCalories = foodLog.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foodLog.reduce((sum, f) => sum + f.protein, 0);

  document.getElementById('totalCalories').textContent = totalCalories;
  document.getElementById('totalProtein').textContent = totalProtein;

  document.getElementById('remainingCalories').textContent = goals.calories - totalCalories;
  document.getElementById('remainingProtein').textContent = goals.protein - totalProtein;
}

document.addEventListener('DOMContentLoaded', () => {
  updateFoodList();
  updateFoodSelect();
  updateLogList();
  updateTotals();
});
