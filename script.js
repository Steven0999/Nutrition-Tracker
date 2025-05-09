// Global Data
let foodDatabase = [];
let log = [];
let goals = { calories: 0, protein: 0 };

// Tab switching
function switchTab(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");
}

// Save food
function addFoodAndReturn() {
  const name = document.getElementById("newFoodName").value;
  const calories = parseFloat(document.getElementById("newCalories").value);
  const protein = parseFloat(document.getElementById("newProtein").value);
  if (!name || isNaN(calories) || isNaN(protein)) return alert("Fill out all fields.");

  foodDatabase.push({ name, calories, protein });
  updateFoodDatabaseTable();
  alert("Food saved!");
  switchTab({ currentTarget: document.querySelector('[onclick*="trackerTab"]') }, "trackerTab");
}

// Update database table
function updateFoodDatabaseTable() {
  const tbody = document.getElementById("foodDatabaseBody");
  tbody.innerHTML = "";
  foodDatabase.forEach((f, i) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = f.name;
    row.insertCell(1).innerText = f.calories;
    row.insertCell(2).innerText = f.protein;
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.onclick = () => { foodDatabase.splice(i, 1); updateFoodDatabaseTable(); };
    row.insertCell(3).appendChild(delBtn);
  });
}

// Add entry
function addEntry() {
  const foodName = document.getElementById("searchInput").value;
  const qty = parseFloat(document.getElementById("quantity").value);
  const meal = document.getElementById("mealSelect").value;
  const food = foodDatabase.find(f => f.name.toLowerCase() === foodName.toLowerCase());

  if (!food || isNaN(qty)) return alert("Select a food and valid quantity.");
  const entry = {
    name: food.name,
    calories: food.calories * qty,
    protein: food.protein * qty,
    qty,
    meal,
    proteinPct: ((food.protein * qty) / (food.calories * qty) * 100).toFixed(1)
  };
  log.push(entry);
  updateLogTable();
  document.getElementById("searchInput").value = "";
}

// Reset
function resetLog() {
  if (confirm("Clear all entries?")) {
    log = [];
    updateLogTable();
  }
}

// Update log
function updateLogTable() {
  const tbody = document.getElementById("logBody");
  tbody.innerHTML = "";
  let totalCals = 0, totalProt = 0;

  log.forEach((e, i) => {
    totalCals += e.calories;
    totalProt += e.protein;
    const row = tbody.insertRow();
    row.insertCell(0).innerText = e.name;
    row.insertCell(1).innerText = e.calories.toFixed(1);
    row.insertCell(2).innerText = e.protein.toFixed(1);
    row.insertCell(3).innerText = e.qty;
    row.insertCell(4).innerText = e.meal;
    row.insertCell(5).innerText = `${e.proteinPct}%`;
    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.onclick = () => { log.splice(i, 1); updateLogTable(); };
    row.insertCell(6).appendChild(btn);
  });

  document.getElementById("totalCalories").innerText = totalCals.toFixed(1);
  document.getElementById("totalProtein").innerText = totalProt.toFixed(1);
  document.getElementById("goalCalories").innerText = goals.calories;
  document.getElementById("goalProtein").innerText = goals.protein;
  document.getElementById("remainingCalories").innerText = (goals.calories - totalCals).toFixed(1);
  document.getElementById("remainingProtein").innerText = (goals.protein - totalProt).toFixed(1);
}

// Save goals
function saveGoals() {
  goals.calories = parseFloat(document.getElementById("goalCaloriesInput").value) || 0;
  goals.protein = parseFloat(document.getElementById("goalProteinInput").value) || 0;
  alert("Goals saved!");
  updateLogTable();
}

// Search
function searchFood() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const results = foodDatabase.filter(f => f.name.toLowerCase().includes(query));
  const container = document.getElementById("searchResults");
  container.innerHTML = "";
  results.forEach(food => {
    const div = document.createElement("div");
    div.textContent = `${food.name} (${food.calories} cal, ${food.protein}g protein)`;
    div.onclick = () => document.getElementById("searchInput").value = food.name;
    container.appendChild(div);
  });
  if (!results.length && query.length > 2) {
    const div = document.createElement("div");
    div.textContent = `Food not found. Click to create "${query}"`;
    div.onclick = () => {
      document.getElementById("newFoodName").value = query;
      switchTab({ currentTarget: document.querySelector('[data-tab="createTab"]') }, "createTab");
    };
    container.appendChild(div);
  }
}

// Scanner
let scanner;
function startScanner() {
  const reader = document.getElementById("reader");
  reader.innerHTML = "";
  scanner = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices => {
    const backCam = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];
    scanner.start(
      backCam.id,
      { fps: 10, qrbox: 250 },
      (code) => {
        scanner.stop();
        fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
          .then(res => res.json())
          .then(data => {
            const prod = data.product;
            if (!prod) return alert("Food not found.");
            const name = prod.product_name || "Unnamed";
            const cal = prod.nutriments["energy-kcal_100g"];
            const prot = prod.nutriments["proteins_100g"];
            if (!cal || !prot) return alert("Incomplete data.");
            document.getElementById("newFoodName").value = name;
            document.getElementById("newCalories").value = cal;
            document.getElementById("newProtein").value = prot;
            alert("Scanned! Fill in the rest if needed.");
          });
      },
      err => console.warn("Scan error", err)
    );
  });
}
