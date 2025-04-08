document.addEventListener("DOMContentLoaded", () => {
  openTab(null, "Tracker");
  setupTabs();
  addFoodToSelect();
  loadGoals();
});

// Tab switching logic
function setupTabs() {
  const tabLinks = document.querySelectorAll(".tablink");
  tabLinks.forEach((btn, index) => {
    btn.addEventListener("click", function (e) {
      openTab(e, btn.textContent.replace(/\s/g, ""));
    });
  });
}

function openTab(evt, tabName) {
  const contents = document.querySelectorAll(".tabcontent");
  contents.forEach(c => c.style.display = "none");

  document.getElementById(tabName).style.display = "block";

  document.querySelectorAll(".tablink").forEach(btn => btn.classList.remove("active"));
  if (evt) evt.currentTarget.classList.add("active");
  else document.querySelector(".tablink").classList.add("active");
}

// Data
let foodDatabase = JSON.parse(localStorage.getItem("foodDatabase")) || [];
let totalCalories = 0;
let totalProtein = 0;
let goalCalories = parseInt(localStorage.getItem("goalCalories")) || 0;
let goalProtein = parseInt(localStorage.getItem("goalProtein")) || 0;

// Populate food dropdown
function addFoodToSelect() {
  const select = document.getElementById("foodSelect");
  select.innerHTML = `<option disabled selected>Select Item</option>`;
  foodDatabase.forEach(food => {
    const option = document.createElement("option");
    option.value = food.name;
    option.text = food.name;
    select.appendChild(option);
  });
}

// Add food entry
function addEntry() {
  const foodName = document.getElementById("foodSelect").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const food = foodDatabase.find(f => f.name === foodName);

  if (!food || !quantity) return;

  const entryCalories = food.calories * quantity;
  const entryProtein = food.protein * quantity;

  totalCalories += entryCalories;
  totalProtein += entryProtein;

  updateTotals();

  const li = document.createElement("li");
  li.textContent = `${food.name} x${quantity} - ${entryCalories} cal, ${entryProtein}g protein`;
  document.getElementById("entryList").appendChild(li);
}

// Save new food
function saveNewFood() {
  const name = document.getElementById("newFoodName").value.trim();
  const calories = parseInt(document.getElementById("newFoodCalories").value);
  const protein = parseInt(document.getElementById("newFoodProtein").value);

  if (!name || isNaN(calories) || isNaN(protein)) return alert("Fill in all fields");

  foodDatabase.push({ name, calories, protein });
  localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase));
  addFoodToSelect();

  document.getElementById("newFoodName").value = '';
  document.getElementById("newFoodCalories").value = '';
  document.getElementById("newFoodProtein").value = '';

  alert("Food saved!");
}

// Save goals
function confirmGoal() {
  goalCalories = parseInt(document.getElementById("goalCalories").value);
  goalProtein = parseInt(document.getElementById("goalProtein").value);

  localStorage.setItem("goalCalories", goalCalories);
  localStorage.setItem("goalProtein", goalProtein);

  loadGoals();
  updateTotals();
}

// Load goal display
function loadGoals() {
  if (goalCalories && goalProtein) {
    document.getElementById("goalDisplay").innerHTML = `
      <p>Calorie Goal: ${goalCalories}</p>
      <p>Protein Goal: ${goalProtein}g</p>
    `;
  }
}

// Update totals
function updateTotals() {
  document.getElementById("totals").innerHTML = `
    <p>Total Calories: ${totalCalories}</p>
    <p>Total Protein: ${totalProtein}g</p>
    <p>Remaining Calories: ${goalCalories - totalCalories}</p>
    <p>Remaining Protein: ${goalProtein - totalProtein}g</p>
  `;
}
