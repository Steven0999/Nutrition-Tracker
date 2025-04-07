let foodDatabase = JSON.parse(localStorage.getItem("foodDatabase")) || [];
let entries = JSON.parse(localStorage.getItem("history")) || [];
let goalCalories = parseFloat(localStorage.getItem("goalCalories")) || 0;
let goalProtein = parseFloat(localStorage.getItem("goalProtein")) || 0;

document.addEventListener("DOMContentLoaded", () => {
  updateFoodDropdown();
  updateEntriesList();
  updateTotals();
  updateGoalDisplay();
  showTab(0);  // Start on the first tab (Tracker)
});

function saveNewFood() {
  const name = document.getElementById("newFoodName").value;
  const calories = parseFloat(document.getElementById("newFoodCalories").value);
  const protein = parseFloat(document.getElementById("newFoodProtein").value);

  if (!name || isNaN(calories) || isNaN(protein)) {
    alert('Please enter valid food data.');
    return;
  }

  const newFood = { name, calories, protein };
  foodDatabase.push(newFood);

  localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase));

  document.getElementById("newFoodName").value = "";
  document.getElementById("newFoodCalories").value = "";
  document.getElementById("newFoodProtein").value = "";

  updateFoodDropdown();
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

  localStorage.setItem("history", JSON.stringify(entries));

  updateEntriesList();
  updateTotals();
}

function updateEntriesList() {
  const list = document.getElementById("entryList");
  list.innerHTML = "";

  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${entry.name}: ${entry.calories.toFixed(1)} kcal, ${entry.protein.toFixed(1)}g protein 
                    <button class="delete" onclick="deleteEntry(${index})">X</button>`;
    list.appendChild(li);
  });
}

function deleteEntry(index) {
  entries.splice(index, 1);

  localStorage.setItem("history", JSON.stringify(entries));

  updateEntriesList();
  updateTotals();
}

function updateTotals() {
  const totalCalories = entries.reduce((acc, entry) => acc + entry.calories, 0);
  const totalProtein = entries.reduce((acc, entry) => acc + entry.protein, 0);

  const remainingCalories = goalCalories - totalCalories;
  const remainingProtein = goalProtein - totalProtein;

  document.querySelector("#totals p:nth-child(1)").textContent = `Total Calories: ${totalCalories.toFixed(1)}`;
  document.querySelector("#totals p:nth-child(2)").textContent = `Total Protein: ${totalProtein.toFixed(1)}g`;
  document.querySelector("#totals p:nth-child(3)").textContent = `Remaining Calories: ${remainingCalories.toFixed(1)}`;
  document.querySelector("#totals p:nth-child(4)").textContent = `Remaining Protein: ${remainingProtein.toFixed(1)}g`;
}

function confirmGoal() {
  goalCalories = parseFloat(document.getElementById("goalCalories").value);
  goalProtein = parseFloat(document.getElementById("goalProtein").value);

  if (isNaN(goalCalories) || isNaN(goalProtein)) {
    alert('Please enter valid goals.');
    return;
  }

  localStorage.setItem("goalCalories", goalCalories);
  localStorage.setItem("goalProtein", goalProtein);

  updateGoalDisplay();
  updateTotals();
}

function updateGoalDisplay() {
  document.getElementById("goalDisplay").innerHTML = `
    <p>Calorie Goal: ${goalCalories} kcal</p>
    <p>Protein Goal: ${goalProtein}g</p>
  `;
}

function showTab(tabIndex) {
  const tabs = document.querySelectorAll('.tabContent');
  tabs.forEach((tab, index) => {
    if (index === tabIndex) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}
