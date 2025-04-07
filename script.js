// Function to open a specific tab
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

// Food Tracker logic
let foodDatabase = JSON.parse(localStorage.getItem("foodDatabase")) || [];
let totalCalories = 0;
let totalProtein = 0;
let goalCalories = localStorage.getItem("goalCalories") || 0;
let goalProtein = localStorage.getItem("goalProtein") || 0;

function addFoodToSelect() {
  const foodSelect = document.getElementById("foodSelect");
  foodSelect.innerHTML = '<option disabled selected>Select Item</option>';

  foodDatabase.forEach(food => {
    const option = document.createElement("option");
    option.value = food.name;
    option.text = food.name;
    foodSelect.appendChild(option);
  });
}

function addEntry() {
  const foodSelect = document.getElementById("foodSelect");
  const quantity = parseInt(document.getElementById("quantity").value);
  const selectedFood = foodDatabase.find(food => food.name === foodSelect.value);

  if (selectedFood) {
    const calories = selectedFood.calories * quantity;
    const protein = selectedFood.protein * quantity;

    totalCalories += calories;
    totalProtein += protein;

    document.getElementById("totals").innerHTML = `
      <p>Total Calories: ${totalCalories}</p>
      <p>Total Protein: ${totalProtein}g</p>
      <p>Remaining Calories: ${goalCalories - totalCalories}</p>
      <p>Remaining Protein: ${goalProtein - totalProtein}g</p>
    `;

    const entryList = document.getElementById("entryList");
    const li = document.createElement("li");
    li.textContent = `${selectedFood.name} x ${quantity} - ${calories} Calories, ${protein}g Protein`;
    entryList.appendChild(li);
  }
}

function saveNewFood() {
  const foodName = document.getElementById("newFoodName").value;
  const calories = parseInt(document.getElementById("newFoodCalories").value);
  const protein = parseInt(document.getElementById("newFoodProtein").value);

  const newFood = {
    name: foodName,
    calories: calories,
    protein: protein
  };

  foodDatabase.push(newFood);
  localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase));

  addFoodToSelect();
  alert("Food saved successfully!");
  document.getElementById("newFoodName").value = '';
  document.getElementById("newFoodCalories").value = '';
  document.getElementById("newFoodProtein").value = '';
}

function confirmGoal() {
  goalCalories = parseInt(document.getElementById("goalCalories").value);
  goalProtein = parseInt(document.getElementById("goalProtein").value);

  localStorage.setItem("goalCalories", goalCalories);
  localStorage.setItem("goalProtein", goalProtein);

  document.getElementById("goalDisplay").innerHTML = `
    <p>Calorie Goal: ${goalCalories}</p>
    <p>Protein Goal: ${goalProtein}g</p>
  `;
}

// Initialize food selection
addFoodToSelect();

// Set default tab to open
document.querySelector(".tablink").click();
