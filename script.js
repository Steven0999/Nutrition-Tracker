// === Firebase Setup ===
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Switch tabs
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tabContent');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// === Barcode Scanning ===
function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'),
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader"]
        }
    }, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function (result) {
        const code = result.codeResult.code;
        Quagga.stop();
        fetchFoodData(code);
    });
}

function fetchFoodData(barcode) {
    // Placeholder function – you can integrate with a food API
    console.log("Barcode detected:", barcode);
    alert("Food detected: " + barcode);
    const sampleFood = {
        name: "Sample Food",
        calories: 250,
        protein: 10,
        date: new Date().toISOString().split("T")[0]
    };
    saveFoodData(sampleFood);
}

// === Firebase: Save Food Data ===
function saveFoodData(foodData) {
    const userId = "demoUser";
    const newFoodKey = database.ref().child(`users/${userId}/foodEntries`).push().key;
    const updates = {};
    updates[`/users/${userId}/foodEntries/${newFoodKey}`] = foodData;
    return database.ref().update(updates);
}

// === Food Database: Create New Food ===
function showCreateFoodForm() {
    document.getElementById("createFoodForm").style.display = 'block';
}

function saveNewFood() {
    const name = document.getElementById("newFoodName").value;
    const calories = parseInt(document.getElementById("newFoodCalories").value);
    const protein = parseInt(document.getElementById("newFoodProtein").value);

    const newFood = {
        name,
        calories,
        protein,
        date: new Date().toISOString().split("T")[0]
    };
    saveFoodData(newFood);
    alert("Food saved!");
    loadFoodList();
    document.getElementById("createFoodForm").style.display = 'none';
}

// === Goal Setting ===
function saveGoals() {
    const goalCalories = parseInt(document.getElementById("goalCalories").value);
    const goalProtein = parseInt(document.getElementById("goalProtein").value);

    const userId = "demoUser";
    database.ref(`users/${userId}/goals`).set({
        calories: goalCalories,
        protein: goalProtein
    });
    alert("Goals saved!");
}

// === Food List & Tracking ===
function loadFoodList() {
    const userId = "demoUser";
    database.ref(`users/${userId}/foodEntries`).once('value').then(snapshot => {
        const foodEntries = snapshot.val();
        const foodListDiv = document.getElementById('food-list');
        foodListDiv.innerHTML = '';
        Object.keys(foodEntries).forEach(key => {
            const food = foodEntries[key];
            const div = document.createElement('div');
            div.innerHTML = `${food.name} - Calories: ${food.calories}, Protein: ${food.protein}`;
            foodListDiv.appendChild(div);
        });
    });
}

// === Weekly/Monthly Averages ===
function calculateAverages() {
    const userId = "demoUser";
    database.ref(`users/${userId}/foodEntries`).once('value').then(snapshot => {
        const foodEntries = snapshot.val();
        const weeklyAverages = {};
        const monthlyAverages = {};

        Object.values(foodEntries).forEach(entry => {
            const date = new Date(entry.date);
            const week = getWeekNumber(date);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const weekKey = `${year}-W${week}`;
            const monthKey = `${year}-${month}`;

            if (!weeklyAverages[weekKey]) weeklyAverages[weekKey] = { calories: 0, protein: 0, days: 0 };
            if (!monthlyAverages[monthKey]) monthlyAverages[monthKey] = { calories: 0, protein: 0, days: 0 };

            weeklyAverages[weekKey].calories += entry.calories;
            weeklyAverages[weekKey].protein += entry.protein;
            weeklyAverages[weekKey].days++;

            monthlyAverages[monthKey].calories += entry.calories;
            monthlyAverages[monthKey].protein += entry.protein;
            monthlyAverages[monthKey].days++;
        });

        renderAverages('weekly-averages', weeklyAverages);
        renderAverages('monthly-averages', monthlyAverages);
    });
}

function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function renderAverages(containerId, dataObj) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (const [key, data] of Object.entries(dataObj)) {
        const avgCal = (data.calories / data.days).toFixed(0);
        const avgProt = (data.protein / data.days).toFixed(0);
        const div = document.createElement('div');
        div.textContent = `${key}: Calories = ${avgCal}, Protein = ${avgProt}`;
        container.appendChild(div);
    }
}

// === Graph Plotting ===
function plotGraphs() {
    const ctxCalories = document.getElementById('caloriesChart').getContext('2d');
    const ctxProtein = document.getElementById('proteinChart').getContext('2d');

    const userId = "demoUser";
    database.ref(`users/${userId}/foodEntries`).once('value').then(snapshot => {
        const foodEntries = snapshot.val();
        const dates = [];
        const calories = [];
        const protein = [];

        Object.values(foodEntries).forEach(entry => {
            dates.push(entry.date);
            calories.push(entry.calories);
            protein.push(entry.protein);
        });

        new Chart(ctxCalories, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Calories',
                    data: calories,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    }
                }
            }
        });

        new Chart(ctxProtein, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Protein',
                    data: protein,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Protein'
                        }
                    }
                }
            }
        });
    });
}

// Initialize with loading food list and setting up averages and graphs
document.addEventListener('DOMContentLoaded', () => {
    loadFoodList();
    calculateAverages();
    plotGraphs();
});
