function switchTab(tabId) {
  document.querySelectorAll('.tabContent').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}
switchTab('tracker');

let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];
let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || { calories: 0, protein: 0 };
let history = JSON.parse(localStorage.getItem('history')) || {};

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
    const entry = {
      name: food.name,
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      date: new Date().toLocaleDateString('en-GB')
    };
    foodLog.push(entry);
    localStorage.setItem('foodLog', JSON.stringify(foodLog));
    logToHistory(entry);
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

function logToHistory(entry) {
  const date = entry.date;
  if (!history[date]) history[date] = { calories: 0, protein: 0 };
  history[date].calories += entry.calories;
  history[date].protein += entry.protein;
  localStorage.setItem('history', JSON.stringify(history));
}

function renderHistory() {
  const range = document.getElementById('historyRange').value;
  const now = new Date();
  const result = Object.entries(history).filter(([dateStr]) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    if (range === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    } else {
      return date.getMonth() === now.getMonth();
    }
  });

  let totalCal = 0, totalProt = 0;
  result.forEach(([_, data]) => {
    totalCal += data.calories;
    totalProt += data.protein;
  });

  const avgCal = Math.round(totalCal / result.length || 1);
  const avgProt = Math.round(totalProt / result.length || 1);

  document.getElementById('historyData').innerHTML =
    `<p>Average Calories: ${avgCal}</p><p>Average Protein: ${avgProt}g</p>`;
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
  updateFoodList();
  updateFoodSelect();
  updateLogList();
  updateTotals();
});
