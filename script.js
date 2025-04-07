let goalCalories = 0;
let goalProtein = 0;
let foodDatabase = JSON.parse(localStorage.getItem("foodDatabase")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let entries = [];

document.addEventListener("DOMContentLoaded", () => {
  // Show first tab by default
  document.querySelectorAll(".tabContent")[0].classList.add("active");

  // Tab switching logic
  document.querySelectorAll(".tabs button").forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tabContent").forEach(tab => tab.classList.remove("active"));
      document.querySelectorAll(".tabContent")[idx].classList.add("active");
    });
  });

  updateFoodDropdown();
  updateGoalDisplay();
  updateTotals();
  updateHistoryView();
  updateEntriesList();
});

function addEntry() {
  const foodSelect = document.getElementById("foodSelect");
  const quantity = parseFloat(document.getElementById("quantity").value) || 1;
  const selectedFood = foodDatabase.find(f => f.name === foodSelect.value);
  if (!selectedFood) return;

  const calories = selectedFood.calories * quantity;
  const protein = selectedFood.protein * quantity;
  const date = new Date().toISOString();

  const entry = { name: selectedFood.name, calories, protein, date };
  entries.push(entry);
  history.push({ ...entry });
  saveData();
  updateEntriesList();
  updateTotals();
  updateHistoryView();
}

function saveNewFood() {
  const name = document.getElementById("newFoodName").value;
  const calories = parseFloat(document.getElementById("newFoodCalories").value);
  const protein = parseFloat(document.getElementById("newFoodProtein").value);
  if (!name || isNaN(calories) || isNaN(protein)) return;

  foodDatabase.push({ name, calories, protein });
  saveData();
  updateFoodDropdown();

  // Clear form and go back to main tracker
  document.getElementById("newFoodName").value = "";
  document.getElementById("newFoodCalories").value = "";
  document.getElementById("newFoodProtein").value = "";
  document.querySelectorAll(".tabContent")[0].classList.add("active");
  document.querySelectorAll(".tabContent")[2].classList.remove("active");
}

function updateFoodDropdown() {
  const foodSelect = document.getElementById("foodSelect");
  foodSelect.innerHTML = `<option disabled selected>Select Item</option>`;
  foodDatabase.forEach(food => {
    const option = document.createElement("option");
    option.value = food.name;
    option.textContent = food.name;
    foodSelect.appendChild(option);
  });
}

function updateEntriesList() {
  const list = document.getElementById("entryList");
  list.innerHTML = "";
  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${entry.name}: ${entry.calories.toFixed(1)} kcal, ${entry.protein.toFixed(1)}g protein 
      <button class="delete" onclick="deleteEntry(${index})">X</button>
    `;
    list.appendChild(li);
  });
}

function deleteEntry(index) {
  entries.splice(index, 1);
  saveData();
  updateEntriesList();
  updateTotals();
}

function updateTotals() {
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const remainingCalories = goalCalories - totalCalories;
  const remainingProtein = goalProtein - totalProtein;

  document.getElementById("totals").innerHTML = `
    <p>Total Calories: ${totalCalories.toFixed(1)}</p>
    <p>Total Protein: ${totalProtein.toFixed(1)}g</p>
    <p>Remaining Calories: ${remainingCalories.toFixed(1)}</p>
    <p>Remaining Protein: ${remainingProtein.toFixed(1)}g</p>
  `;
}

function confirmGoal() {
  goalCalories = parseFloat(document.getElementById("goalCalories").value);
  goalProtein = parseFloat(document.getElementById("goalProtein").value);
  saveData();
  updateGoalDisplay();
  updateTotals();
}

function updateGoalDisplay() {
  document.getElementById("goalDisplay").innerHTML = `
    <p>Goal Calories: ${goalCalories || 0}</p>
    <p>Goal Protein: ${goalProtein || 0}g</p>
  `;
}

function updateHistoryView() {
  const historyData = document.getElementById("historyData");
  historyData.innerHTML = "";

  if (history.length === 0) {
    historyData.innerHTML = "<p>No data saved yet.</p>";
    return;
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const last7Days = {};
  const thisMonth = {};

  history.forEach(entry => {
    const date = new Date(entry.date);
    const dayName = date.toLocaleDateString("en-GB", { weekday: "long" });

    // Last 7 days
    if ((today - date) / (1000 * 60 * 60 * 24) <= 6) {
      if (!last7Days[dayName]) {
        last7Days[dayName] = { calories: 0, protein: 0 };
      }
      last7Days[dayName].calories += entry.calories;
      last7Days[dayName].protein += entry.protein;
    }

    // This month, grouped by week number
    if (date >= startOfMonth) {
      const weekNum = Math.floor((date.getDate() - 1) / 7) + 1;
      const key = `Week ${weekNum}`;
      if (!thisMonth[key]) {
        thisMonth[key] = { calories: 0, protein: 0, dates: [] };
      }
      thisMonth[key].calories += entry.calories;
      thisMonth[key].protein += entry.protein;
      thisMonth[key].dates.push(date.getDate());
    }
  });

  let html = `<h3>Last 7 Days</h3><ul>`;
  ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].forEach(day => {
    const data = last7Days[day];
    if (data) {
      html += `<li>${day}: ${data.calories.toFixed(1)} kcal, ${data.protein.toFixed(1)}g protein</li>`;
    } else {
      html += `<li>${day}: 0 kcal, 0g protein</li>`;
    }
  });
  html += "</ul><h3>This Month</h3><ul>";
  Object.keys(thisMonth).forEach(week => {
    const data = thisMonth[week];
    const range = `${Math.min(...data.dates)}–${Math.max(...data.dates)}`;
    html += `<li>${week} (${range}): ${data.calories.toFixed(1)} kcal, ${data.protein.toFixed(1)}g protein</li>`;
  });
  html += "</ul>";

  historyData.innerHTML = html;
}

function saveData() {
  localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase));
  localStorage.setItem("history", JSON.stringify(history));
}
