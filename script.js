const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const dodgeMeterEl = document.getElementById("dodgeMeter");
const bestScoreEl = document.getElementById("bestScore");
const statusMessageEl = document.getElementById("statusMessage");
const driverListEl = document.getElementById("driverList");
const kartListEl = document.getElementById("kartList");
const locationListEl = document.getElementById("locationList");
const steeringListEl = document.getElementById("steeringList");
const ageListEl = document.getElementById("ageList");
const abilityInfoEl = document.getElementById("abilityInfo");
const careerStatsEl = document.getElementById("careerStats");
const championshipListEl = document.getElementById("championshipList");
const newsListEl = document.getElementById("newsList");
const achievementListEl = document.getElementById("achievementList");
const dailyChallengeListEl = document.getElementById("dailyChallengeList");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");
const activateAbilityButton = document.getElementById("activateAbilityButton");
const installButton = document.getElementById("installButton");

let deferredInstallPrompt = null;

let laneCenters = [100, 210, 320];
let playerWidth = 52;
let playerHeight = 82;
let playerY = canvas.height - 140;

// Keep a reference scale (based on original 420x720 canvas) and update sizes on resize
let deviceScale = 1;
function adjustCanvasSize() {
  // Make the canvas match the displayed CSS size and account for devicePixelRatio for crisp rendering
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.max(480, Math.floor(rect.height * dpr));

  // Compute a scale relative to original design width (420px)
  deviceScale = canvas.width / (420 * dpr);
  playerWidth = Math.max(32, Math.round(52 * deviceScale));
  playerHeight = Math.max(48, Math.round(82 * deviceScale));
  playerY = canvas.height - Math.round(140 * deviceScale);

  // Road boundaries mirrored from CSS/layout: original left margin was 62px
  const roadLeft = Math.round(62 * deviceScale);
  const roadRight = canvas.width - roadLeft;
  const roadWidth = Math.max(180, roadRight - roadLeft);
  laneCenters = [Math.round(roadLeft + roadWidth * 0.25), Math.round(roadLeft + roadWidth * 0.5), Math.round(roadLeft + roadWidth * 0.75)];

  // Keep player X in the correct lane
  state.playerX = laneCenters[state.playerLane] || laneCenters[1];
  state.playerTargetX = laneCenters[state.playerLane] || laneCenters[1];
}

// Debounced resize handler
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    adjustCanvasSize();
  }, 120);
});
window.addEventListener('orientationchange', () => {
  setTimeout(adjustCanvasSize, 120);
});


const drivers = [
  {
    id: "mira",
    name: "Mira Kart",
    ability: "Shield Drift",
    abilityText: "Creates a shield that blocks one traffic hit.",
    carId: "mini-drift",
    color: "#38bdf8",
    unlockLevel: 1,
  },
  {
    id: "dante",
    name: "Dante Rush",
    ability: "Turbo Boost",
    abilityText: "Boosts speed and adds a quick score bonus.",
    carId: "boost-bolt",
    color: "#f43f5e",
    unlockLevel: 1,
  },
  {
    id: "jules",
    name: "Jules Drift",
    ability: "Echo Slip",
    abilityText: "Drops traffic speed for a short dodge rush.",
    carId: "echo-racer",
    color: "#a78bfa",
    unlockLevel: 3,
  },
  {
    id: "riko",
    name: "Riko Spark",
    ability: "Moonline Flash",
    abilityText: "Spawns a hidden dodge pickup and brightens the road.",
    carId: "nova-kart",
    color: "#f59e0b",
    unlockLevel: 5,
  },
];

const cars = [
  { id: "mini-drift", name: "Mini Drift", color: "#38bdf8", accent: "#f8fafc", unlockLevel: 1, speed: 0.95, handling: 1.0, dodgeLevel: 1 },
  { id: "boost-bolt", name: "Boost Bolt", color: "#f43f5e", accent: "#ffe4e6", unlockLevel: 1, speed: 1.04, handling: 0.96, dodgeLevel: 2 },
  { id: "echo-racer", name: "Echo Racer", color: "#8b5cf6", accent: "#ede9fe", unlockLevel: 3, speed: 1.0, handling: 1.08, dodgeLevel: 3 },
  { id: "nova-kart", name: "Nova Kart", color: "#f59e0b", accent: "#fff7ed", unlockLevel: 5, speed: 1.08, handling: 1.0, dodgeLevel: 4 },
  { id: "shadow-lap", name: "Shadow Lap", color: "#111827", accent: "#fef3c7", unlockLevel: 7, speed: 1.1, handling: 1.12, dodgeLevel: 5 },
];

const locations = [
  { id: "city-loop", name: "City Loop", theme: "sunset", difficulty: 1, description: "Bright streets with tight corners and sudden traffic bursts." },
  { id: "coast-curve", name: "Coast Curve", theme: "coast", difficulty: 2, description: "Ocean breeze, slippery turns, and wave-themed cones." },
  { id: "night-maze", name: "Night Maze", theme: "night", difficulty: 3, description: "Glow markers, neon signs, and sharp lane changes." },
  { id: "mountain-drift", name: "Mountain Drift", theme: "mountain", difficulty: 4, description: "Steep turns and rocky obstacles for pro dodge runs." },
];

const steeringOptions = [
  { id: "arcade", name: "Arcade", description: "Easy and responsive lane changes.", sensitivity: 0.22 },
  { id: "precision", name: "Precision", description: "Sharper turns with tighter control.", sensitivity: 0.17 },
  { id: "drift", name: "Drift", description: "Swingier but more stylish handling.", sensitivity: 0.28 },
];

const ageOptions = [
  { id: "kid", name: "Kid", description: "Gentle speed and extra help.", bonus: 0.08 },
  { id: "teen", name: "Teen", description: "Balanced challenge and steady controls.", bonus: 0.0 },
  { id: "adult", name: "Adult", description: "Harder dodge timing and more pressure.", bonus: -0.05 },
];

const achievementDefs = [
  { id: "first-race", title: "First Lap", description: "Finish your first race.", unlockAt: 0 },
  { id: "double-digit", title: "Double Digit", description: "Beat 100 score in a race.", unlockAt: 100 },
  { id: "combo-queen", title: "Combo Queen", description: "Reach a combo of 10.", unlockAt: 10 },
  { id: "easter-finder", title: "Easter Finder", description: "Collect the hidden dodge egg.", unlockAt: 0 },
  { id: "champion", title: "Championship Hero", description: "Complete a championship event.", unlockAt: 0 },
];

const state = {
  running: false,
  gameOver: false,
  playerLane: 1,
  playerX: laneCenters[1],
  playerTargetX: laneCenters[1],
  obstacles: [],
  powerups: [],
  score: 0,
  bestScore: 0,
  combo: 0,
  dodgeMeter: 0,
  totalDodges: 0,
  lastSpawnTime: 0,
  spawnInterval: 900,
  speed: 360,
  roadOffset: 0,
  lastTimestamp: 0,
  abilityCharge: 2,
  shieldActive: false,
  boostActive: false,
  dodgeRushActive: false,
  easterEggActive: false,
  shieldTimer: 0,
  boostTimer: 0,
  dodgeRushTimer: 0,
  easterEggTimer: 0,
  currentDriverId: "mira",
  currentCarId: "mini-drift",
  currentLocationId: "city-loop",
  currentSteeringId: "arcade",
  currentAgeId: "teen",
  career: { level: 1, xp: 0, credits: 140, reputation: 0 },
  achievements: [],
  dailyChallenges: [
    { id: "score-200", title: "Hit 200 score", description: "Finish a run with at least 200 points.", progress: 0, target: 200, reward: 90, completed: false },
    { id: "dodge-12", title: "Chain 12 dodges", description: "Dodge 12 traffic cars in a single run.", progress: 0, target: 12, reward: 75, completed: false },
    { id: "ability-1", title: "Use an ability", description: "Activate a driver ability in a run.", progress: 0, target: 1, reward: 70, completed: false },
  ],
  championship: {
    eventIndex: 0,
    score: 0,
    events: [
      { name: "City Sprint", target: 180, reward: 120 },
      { name: "Coastal Drift", target: 260, reward: 160 },
      { name: "Night Rush", target: 360, reward: 220 },
    ],
  },
  news: [
    "Friendly gokart dodge fun is ready for young racers.",
    "Easy steering and gentle challenge modes make every run fun.",
    "Hidden dodge eggs are now appearing in the lane traffic.",
  ],
};

function getSelectedDriver() {
  return drivers.find((driver) => driver.id === state.currentDriverId);
}

function getSelectedCar() {
  return cars.find((car) => car.id === state.currentCarId);
}

function pushNews(message) {
  state.news.unshift(message);
  state.news = state.news.slice(0, 4);
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  comboEl.textContent = state.combo;
  dodgeMeterEl.textContent = `${Math.min(100, state.dodgeMeter)}%`;
  bestScoreEl.textContent = state.bestScore;
}

function updateStatusMessage(message) {
  statusMessageEl.textContent = message;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.error("Service worker registration failed", error);
  });
}

function renderDriverPicker() {
  driverListEl.innerHTML = "";
  drivers.forEach((driver) => {
    const unlocked = state.career.level >= driver.unlockLevel;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill ${state.currentDriverId === driver.id ? "selected" : ""} ${unlocked ? "" : "locked"}`;
    button.disabled = !unlocked;
    button.textContent = unlocked ? `${driver.name} • ${driver.ability}` : `${driver.name} • Lv ${driver.unlockLevel}`;
    button.addEventListener("click", () => {
      state.currentDriverId = driver.id;
      if (!cars.some((car) => car.id === state.currentCarId)) {
        state.currentCarId = driver.carId;
      }
      if (!cars.some((car) => car.id === state.currentCarId && state.career.level >= car.unlockLevel)) {
        state.currentCarId = driver.carId;
      }
      renderDriverPicker();
      renderCarPicker();
      renderAbilityInfo();
      renderAllPanels();
      updateStatusMessage(`${driver.name} is ready for the next race.`);
    });
    driverListEl.appendChild(button);
  });
}

function renderCarPicker() {
  kartListEl.innerHTML = "";
  cars.forEach((car) => {
    const unlocked = state.career.level >= car.unlockLevel;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill ${state.currentCarId === car.id ? "selected" : ""} ${unlocked ? "" : "locked"}`;
    button.disabled = !unlocked;
    button.textContent = unlocked ? `${car.name} • Dodge Lv ${car.dodgeLevel} • ${car.speed.toFixed(2)}x` : `${car.name} • Lv ${car.unlockLevel}`;
    button.addEventListener("click", () => {
      state.currentCarId = car.id;
      renderCarPicker();
      renderAbilityInfo();
      renderAllPanels();
      updateStatusMessage(`${car.name} is locked in.`);
    });
    kartListEl.appendChild(button);
  });
}

function renderLocationPicker() {
  locationListEl.innerHTML = "";
  locations.forEach((location) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill ${state.currentLocationId === location.id ? "selected" : ""}`;
    button.textContent = `${location.name} • ${location.description}`;
    button.addEventListener("click", () => {
      state.currentLocationId = location.id;
      renderLocationPicker();
      renderAllPanels();
      updateStatusMessage(`${location.name} is ready for your next run.`);
    });
    locationListEl.appendChild(button);
  });
}

function renderSteeringPicker() {
  steeringListEl.innerHTML = "";
  steeringOptions.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill ${state.currentSteeringId === option.id ? "selected" : ""}`;
    button.textContent = `${option.name} • ${option.description}`;
    button.addEventListener("click", () => {
      state.currentSteeringId = option.id;
      renderSteeringPicker();
      renderAllPanels();
      updateStatusMessage(`${option.name} steering is active.`);
    });
    steeringListEl.appendChild(button);
  });
}

function renderAgePicker() {
  ageListEl.innerHTML = "";
  ageOptions.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill ${state.currentAgeId === option.id ? "selected" : ""}`;
    button.textContent = `${option.name} • ${option.description}`;
    button.addEventListener("click", () => {
      state.currentAgeId = option.id;
      renderAgePicker();
      renderAllPanels();
      updateStatusMessage(`${option.name} age profile is active.`);
    });
    ageListEl.appendChild(button);
  });
}

function renderAbilityInfo() {
  const driver = getSelectedDriver();
  const car = getSelectedCar();
  const location = getSelectedLocation();
  const steering = getSelectedSteering();
  const age = getSelectedAge();
  abilityInfoEl.innerHTML = `
    <strong>${driver.ability}</strong>
    <div>${driver.abilityText}</div>
    <div class="stat-row"><span>Driver</span><span>${driver.name}</span></div>
    <div class="stat-row"><span>GoKart</span><span>${car.name}</span></div>
    <div class="stat-row"><span>Dodge Level</span><span>${car.dodgeLevel}</span></div>
    <div class="stat-row"><span>Location</span><span>${location.name}</span></div>
    <div class="stat-row"><span>Steering</span><span>${steering.name}</span></div>
    <div class="stat-row"><span>Age</span><span>${age.name}</span></div>
    <div class="stat-row"><span>Charges</span><span>${state.abilityCharge}</span></div>
  `;
}

function renderCareerStats() {
  const driver = getSelectedDriver();
  const car = getSelectedCar();
  const location = getSelectedLocation();
  const steering = getSelectedSteering();
  const age = getSelectedAge();
  careerStatsEl.innerHTML = `
    <div class="stat-row"><span>Level</span><span>${state.career.level}</span></div>
    <div class="stat-row"><span>XP</span><span>${state.career.xp}</span></div>
    <div class="stat-row"><span>Credits</span><span>${state.career.credits}</span></div>
    <div class="stat-row"><span>Reputation</span><span>${state.career.reputation}</span></div>
    <div class="stat-row"><span>Driver</span><span>${driver.name}</span></div>
    <div class="stat-row"><span>GoKart</span><span>${car.name}</span></div>
    <div class="stat-row"><span>Location</span><span>${location.name}</span></div>
    <div class="stat-row"><span>Steering</span><span>${steering.name}</span></div>
    <div class="stat-row"><span>Age</span><span>${age.name}</span></div>
  `;
}

function renderChampionship() {
  const location = getSelectedLocation();
  const event = state.championship.events[state.championship.eventIndex];
  const progress = Math.min(100, Math.round((state.championship.score / event.target) * 100));
  championshipListEl.innerHTML = `
    <div class="stat-row"><span>Event</span><span>${event.name}</span></div>
    <div class="stat-row"><span>Location</span><span>${location.name}</span></div>
    <div class="stat-row"><span>Progress</span><span>${progress}%</span></div>
    <div class="stat-row"><span>Goal</span><span>${event.target} pts</span></div>
    <div class="stat-row"><span>Reward</span><span>${event.reward} credits</span></div>
  `;
}

function renderNews() {
  newsListEl.innerHTML = "";
  state.news.forEach((item) => {
    const li = document.createElement("li");
    li.className = "challenge-item";
    li.textContent = item;
    newsListEl.appendChild(li);
  });
}

function renderAchievements() {
  achievementListEl.innerHTML = "";
  achievementDefs.forEach((achievement) => {
    const unlocked = state.achievements.includes(achievement.id);
    const item = document.createElement("div");
    item.className = "achievement-item";
    item.innerHTML = `
      <div class="achievement-title">
        <span>${achievement.title}</span>
        <span>${unlocked ? "✓" : "○"}</span>
      </div>
      <div class="achievement-meta">${achievement.description}</div>
    `;
    achievementListEl.appendChild(item);
  });
}

function renderDailyChallenges() {
  dailyChallengeListEl.innerHTML = "";
  state.dailyChallenges.forEach((challenge) => {
    const progress = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
    const item = document.createElement("div");
    item.className = "challenge-item";
    item.innerHTML = `
      <div class="challenge-title">
        <span>${challenge.title}</span>
        <span>${challenge.completed ? "✓" : `${progress}%`}</span>
      </div>
      <div class="challenge-meta">${challenge.description}</div>
      <div class="challenge-meta">Reward: ${challenge.reward} credits</div>
    `;
    dailyChallengeListEl.appendChild(item);
  });
}

function renderAllPanels() {
  renderCareerStats();
  renderChampionship();
  renderNews();
  renderAchievements();
  renderDailyChallenges();
  renderAbilityInfo();
  renderLocationPicker();
  renderSteeringPicker();
  renderAgePicker();
  updateHud();
}

function getSelectedLocation() {
  return locations.find((location) => location.id === state.currentLocationId);
}

function getSelectedSteering() {
  return steeringOptions.find((option) => option.id === state.currentSteeringId);
}

function getSelectedAge() {
  return ageOptions.find((option) => option.id === state.currentAgeId);
}

function resetRace() {
  state.running = true;
  state.gameOver = false;
  state.playerLane = 1;
  state.playerX = laneCenters[1];
  state.playerTargetX = laneCenters[1];
  state.obstacles = [];
  state.powerups = [];
  state.score = 0;
  state.combo = 0;
  state.dodgeMeter = 0;
  state.totalDodges = 0;
  state.lastSpawnTime = 0;
  state.spawnInterval = 900;
  state.speed = 360;
  state.roadOffset = 0;
  state.lastTimestamp = 0;
  state.abilityCharge = 2;
  state.shieldActive = false;
  state.boostActive = false;
  state.dodgeRushActive = false;
  state.easterEggActive = false;
  state.shieldTimer = 0;
  state.boostTimer = 0;
  state.dodgeRushTimer = 0;
  state.easterEggTimer = 0;
  const location = getSelectedLocation();
  updateStatusMessage(`Race started with ${getSelectedDriver().name} in ${getSelectedCar().name} at ${location.name} (Dodge Lv ${getSelectedCar().dodgeLevel}).`);
  updateHud();
  renderAllPanels();
}

function moveLane(direction) {
  if (state.gameOver || !state.running) {
    return;
  }
  const nextLane = Math.max(0, Math.min(laneCenters.length - 1, state.playerLane + direction));
  if (nextLane !== state.playerLane) {
    state.playerLane = nextLane;
    state.playerTargetX = laneCenters[nextLane];
  }
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * laneCenters.length);
  const obsW = Math.max(36, Math.round(playerWidth * 1.05));
  const obsH = Math.max(48, Math.round(playerHeight * 0.88));
  state.obstacles.push({
    lane,
    x: laneCenters[lane],
    y: -obsH - 8,
    width: obsW,
    height: obsH,
    color: Math.random() > 0.5 ? "#f43f5e" : "#fb923c",
  });
}

function spawnPowerup() {
  if (Math.random() > 0.16) {
    return;
  }
  const lane = Math.floor(Math.random() * laneCenters.length);
  const types = ["shield", "boost", "egg"];
  const type = types[Math.floor(Math.random() * types.length)];
  const radius = Math.max(10, Math.round(playerWidth * 0.38));
  state.powerups.push({
    type,
    x: laneCenters[lane],
    y: -radius - 6,
    radius: radius,
  });
}

function collisionDetected(playerRect, obstacle) {
  return (
    playerRect.x < obstacle.x + obstacle.width / 2 &&
    playerRect.x + playerRect.width > obstacle.x - obstacle.width / 2 &&
    playerRect.y < obstacle.y + obstacle.height &&
    playerRect.y + playerRect.height > obstacle.y
  );
}

function powerupHit(powerup) {
  const playerCenterX = state.playerX;
  const playerCenterY = playerY + playerHeight / 2;
  return Math.hypot(powerup.x - playerCenterX, powerup.y - playerCenterY) < powerup.radius + 30;
}

function activateAbility() {
  if (!state.running || state.gameOver || state.abilityCharge <= 0) {
    return;
  }

  const driver = getSelectedDriver();
  state.abilityCharge -= 1;
  state.dailyChallenges.find((challenge) => challenge.id === "ability-1").progress = Math.max(state.dailyChallenges.find((challenge) => challenge.id === "ability-1").progress, 1);
  if (driver.id === "mira") {
    state.shieldActive = true;
    state.shieldTimer = 2.2;
    updateStatusMessage("Shield Pulse ready. One impact will be absorbed.");
  }
  if (driver.id === "dante") {
    state.boostActive = true;
    state.boostTimer = 2.2;
    updateStatusMessage("Nitro Burst is burning up the road.");
  }
  if (driver.id === "jules") {
    state.dodgeRushActive = true;
    state.dodgeRushTimer = 2.2;
    updateStatusMessage("Echo Drift is slowing traffic for a clear lane.");
  }
  if (driver.id === "riko") {
    state.easterEggActive = true;
    state.easterEggTimer = 3.2;
    updateStatusMessage("Moonline Boost released a hidden dodge egg.");
  }
  renderAllPanels();
}

function finishRace() {
  if (state.gameOver) {
    return;
  }
  state.gameOver = true;
  state.running = false;
  state.bestScore = Math.max(state.bestScore, Math.floor(state.score));

  const currentDriver = getSelectedDriver();
  const currentCar = getSelectedCar();
  const xpGain = Math.floor(state.score / 6) + state.combo * 3;
  const creditGain = Math.floor(state.score / 8) + 45;
  state.career.xp += xpGain;
  state.career.credits += creditGain;
  state.career.reputation += Math.max(1, Math.floor(state.score / 60));
  while (state.career.xp >= state.career.level * 140) {
    state.career.xp -= state.career.level * 140;
    state.career.level += 1;
    state.career.credits += 80;
    pushNews(`${currentDriver.name} leveled up to rank ${state.career.level}.`);
  }

  state.championship.score += Math.max(1, Math.floor(state.score / 10));
  const championshipEvent = state.championship.events[state.championship.eventIndex];
  if (state.championship.score >= championshipEvent.target) {
    state.career.credits += championshipEvent.reward;
    state.championship.eventIndex = Math.min(state.championship.eventIndex + 1, state.championship.events.length - 1);
    state.championship.score = 0;
    pushNews(`${championshipEvent.name} cleared. A fresh event is now live.`);
    state.achievements.push("champion");
  }

  const runScore = Math.floor(state.score);
  if (runScore >= 100) {
    state.achievements.push("double-digit");
  }
  if (state.combo >= 10) {
    state.achievements.push("combo-queen");
  }
  if (state.easterEggActive) {
    state.achievements.push("easter-finder");
  }
  if (state.achievements.length > 0) {
    state.achievements = [...new Set(state.achievements)];
  }

  state.dailyChallenges = state.dailyChallenges.map((challenge) => {
    if (challenge.id === "score-200" && runScore >= challenge.target) {
      challenge.progress = challenge.target;
      challenge.completed = true;
      state.career.credits += challenge.reward;
    }
    if (challenge.id === "dodge-12" && state.totalDodges >= challenge.target) {
      challenge.progress = challenge.target;
      challenge.completed = true;
      state.career.credits += challenge.reward;
    }
    if (challenge.id === "ability-1" && challenge.progress >= 1) {
      challenge.progress = 1;
      challenge.completed = true;
      state.career.credits += challenge.reward;
    }
    return challenge;
  });

  state.achievements.push("first-race");
  state.achievements = [...new Set(state.achievements)];

  updateStatusMessage(`Race over. ${currentDriver.name} finished with ${runScore} score and earned ${creditGain} credits.`);
  updateHud();
  renderAllPanels();
}

function drawRoad() {
  const location = getSelectedLocation();
  const roadColor = location.theme === "coast" ? "#16324b" : location.theme === "night" ? "#080b16" : location.theme === "mountain" ? "#2d2217" : "#222831";
  const laneColor = location.theme === "coast" ? "#2a4f5b" : location.theme === "night" ? "#1f2937" : location.theme === "mountain" ? "#4b3a20" : "#374151";
  const stripeColor = state.easterEggActive ? "#fb923c" : location.theme === "coast" ? "#7dd3fc" : location.theme === "night" ? "#f472b6" : location.theme === "mountain" ? "#fde68a" : "#facc15";
  ctx.fillStyle = state.easterEggActive ? "#120f33" : roadColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = state.easterEggActive ? "#2e1065" : laneColor;
  ctx.fillRect(62, 0, canvas.width - 124, canvas.height);

  ctx.strokeStyle = state.easterEggActive ? "#fde68a" : location.theme === "night" ? "#f8fafc" : "#f8fafc";
  ctx.lineWidth = 4;
  ctx.setLineDash([24, 24]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  const stripeSpacing = 60;
  const stripeHeight = 30;
  ctx.fillStyle = stripeColor;
  for (let i = 0; i < 15; i += 1) {
    const y = (state.roadOffset + i * stripeSpacing) % (canvas.height + stripeSpacing) - stripeSpacing;
    ctx.fillRect(canvas.width / 2 - 6, y, 12, stripeHeight);
  }
}

function drawPlayer() {
  const car = getSelectedCar();
  const x = state.playerX;
  ctx.save();
  ctx.translate(x - playerWidth / 2, playerY);
  ctx.fillStyle = car.color;
  ctx.fillRect(0, 0, playerWidth, playerHeight);
  ctx.fillStyle = car.accent;
  ctx.fillRect(8, 18, playerWidth - 16, 24);
  ctx.fillRect(10, 54, playerWidth - 20, 10);
  ctx.fillStyle = "#020617";
  ctx.fillRect(10, 10, 8, 8);
  ctx.fillRect(playerWidth - 18, 10, 8, 8);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(8, 66, 8, 10);
  ctx.fillRect(playerWidth - 16, 66, 8, 10);
  if (state.shieldActive) {
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, playerWidth - 4, playerHeight - 4);
  }
  ctx.restore();
}

function drawObstacles() {
  state.obstacles.forEach((obstacle) => {
    ctx.save();
    ctx.translate(obstacle.x - obstacle.width / 2, obstacle.y);
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(0, 0, obstacle.width, obstacle.height);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(8, 16, obstacle.width - 16, 16);
    ctx.fillRect(8, 44, obstacle.width - 16, 10);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(8, 58, 8, 10);
    ctx.fillRect(obstacle.width - 16, 58, 8, 10);
    ctx.restore();
  });
}

function drawPowerups() {
  state.powerups.forEach((powerup) => {
    ctx.save();
    ctx.translate(powerup.x, powerup.y);
    ctx.fillStyle = powerup.type === "shield" ? "#38bdf8" : powerup.type === "boost" ? "#f43f5e" : "#fde68a";
    ctx.beginPath();
    ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawOverlay() {
  if (!state.gameOver) {
    return;
  }
  ctx.fillStyle = "rgba(2, 6, 23, 0.76)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 34px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("Race Over", canvas.width / 2, 270);
  ctx.font = "20px Segoe UI";
  ctx.fillText(`Score: ${Math.floor(state.score)}`, canvas.width / 2, 320);
  ctx.fillText("Press Start Race to try again", canvas.width / 2, 360);
}

function draw() {
  drawRoad();
  drawObstacles();
  drawPowerups();
  drawPlayer();
  drawOverlay();
}

function frame(timestamp) {
  if (!state.lastTimestamp) {
    state.lastTimestamp = timestamp;
  }

  const delta = Math.min((timestamp - state.lastTimestamp) / 1000, 0.03);
  state.lastTimestamp = timestamp;

  if (state.running) {
    const kart = getSelectedCar();
    const steering = getSelectedSteering();
    const age = getSelectedAge();
    state.roadOffset = (state.roadOffset + delta * 320) % 1000;
    state.playerX += (state.playerTargetX - state.playerX) * (steering.sensitivity + kart.handling * 0.01 + age.bonus);
    state.score += delta * (10 + (state.boostActive ? 2 : 0) + kart.dodgeLevel * 0.25 - Math.max(0, age.bonus * -2));
    state.speed = 320 + Math.min(state.score / 10, 180) + (state.boostActive ? 50 : 0) + kart.dodgeLevel * 8 + Math.max(0, age.bonus * -40);
    state.spawnInterval = Math.max(420, 920 - Math.floor(state.score / 12) - kart.dodgeLevel * 35 + Math.max(0, age.bonus * -60));

    if (state.shieldActive) {
      state.shieldTimer -= delta;
      if (state.shieldTimer <= 0) {
        state.shieldActive = false;
      }
    }

    if (state.boostActive) {
      state.boostTimer -= delta;
      if (state.boostTimer <= 0) {
        state.boostActive = false;
      }
    }

    if (state.dodgeRushActive) {
      state.dodgeRushTimer -= delta;
      if (state.dodgeRushTimer <= 0) {
        state.dodgeRushActive = false;
      }
    }

    if (state.easterEggActive) {
      state.easterEggTimer -= delta;
      if (state.easterEggTimer <= 0) {
        state.easterEggActive = false;
      }
    }

    if (timestamp - state.lastSpawnTime > state.spawnInterval) {
      spawnObstacle();
      if (Math.random() < 0.2) {
        spawnPowerup();
      }
      state.lastSpawnTime = timestamp;
    }

    for (let i = state.obstacles.length - 1; i >= 0; i -= 1) {
      const obstacle = state.obstacles[i];
      obstacle.y += state.speed * delta * (state.dodgeRushActive ? 0.7 : 1);
      if (obstacle.y > canvas.height + 60) {
        state.obstacles.splice(i, 1);
        state.combo += 1;
        state.totalDodges += 1;
        state.dodgeMeter = Math.min(100, state.dodgeMeter + 7 + getSelectedCar().dodgeLevel);
        if (state.combo >= 4) {
          state.dodgeRushActive = true;
          state.dodgeRushTimer = 1.6;
          updateStatusMessage("Dodge rush! Traffic is slowing and your lane feels smoother.");
        }
        continue;
      }

      const playerRect = {
        x: state.playerX - playerWidth / 2,
        y: playerY,
        width: playerWidth,
        height: playerHeight,
      };

      if (collisionDetected(playerRect, obstacle)) {
        if (state.shieldActive) {
          state.shieldActive = false;
          state.shieldTimer = 0;
          state.obstacles.splice(i, 1);
          state.combo = 0;
          state.dodgeMeter = Math.max(0, state.dodgeMeter - 10);
          updateStatusMessage("Shield absorbed the impact. Stay focused.");
        } else {
          finishRace();
          break;
        }
      }
    }

    for (let i = state.powerups.length - 1; i >= 0; i -= 1) {
      const powerup = state.powerups[i];
      powerup.y += 220 * delta;
      if (powerup.y > canvas.height + 30) {
        state.powerups.splice(i, 1);
        continue;
      }
      if (powerupHit(powerup)) {
        state.powerups.splice(i, 1);
        if (powerup.type === "shield") {
          state.shieldActive = true;
          state.shieldTimer = 2.2;
          updateStatusMessage("Shield pickup collected.");
        }
        if (powerup.type === "boost") {
          state.boostActive = true;
          state.boostTimer = 2.2;
          updateStatusMessage("Boost pickup collected.");
        }
        if (powerup.type === "egg") {
          state.easterEggActive = true;
          state.easterEggTimer = 3.2;
          updateStatusMessage("Hidden dodge egg found. Neon traffic has arrived.");
        }
      }
    }
  }

  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveLane(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveLane(1);
  }
  if (event.key === " " && state.gameOver) {
    event.preventDefault();
    resetRace();
  }
  if (event.key.toLowerCase() === "a") {
    event.preventDefault();
    activateAbility();
  }
});

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  if (x < rect.width / 2) {
    moveLane(-1);
  } else {
    moveLane(1);
  }
});

startButton.addEventListener("click", () => {
  resetRace();
});

pauseButton.addEventListener("click", () => {
  state.running = !state.running;
  updateStatusMessage(state.running ? "Race resumed." : "Race paused.");
});

restartButton.addEventListener("click", () => {
  resetRace();
});

activateAbilityButton.addEventListener("click", () => {
  activateAbility();
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    updateStatusMessage("Use your browser install option: Safari → Share → Add to Home Screen, Android Chrome → Install, Windows Edge/Chrome → Install.");
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === "accepted") {
    updateStatusMessage("Installed. Open GoKart Dodge Pro from your home screen or app menu.");
  } else {
    updateStatusMessage("Install was cancelled. You can still use the browser version.");
  }
  deferredInstallPrompt = null;
  installButton.disabled = true;
  installButton.textContent = "Installed";
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.disabled = false;
  installButton.textContent = "Install App";
  updateStatusMessage("Install is available for your device.");
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.disabled = true;
  installButton.textContent = "Installed";
  updateStatusMessage("GoKart Dodge Pro is installed and ready to launch.");
});

registerServiceWorker();
renderDriverPicker();
renderCarPicker();

// Make sure canvas and game sizing is correct before rendering
adjustCanvasSize();
renderAllPanels();
updateHud();

// Fullscreen toggle button behavior
const fullscreenButton = document.getElementById('fullscreenButton');
if (fullscreenButton) {
  fullscreenButton.addEventListener('click', async () => {
    const el = document.querySelector('.game-panel') || document.documentElement;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        fullscreenButton.textContent = 'Exit Fullscreen';
      } else {
        await document.exitFullscreen();
        fullscreenButton.textContent = 'Fullscreen';
      }
    } catch (err) {
      console.warn('Fullscreen request failed', err);
    }
  });
}

window.addEventListener('fullscreenchange', () => {
  // Toggle a fullscreen-mode helper class so CSS can switch to kiosk layout
  const isFs = !!document.fullscreenElement;
  document.documentElement.classList.toggle('fullscreen-mode', isFs);
  // Prevent scrolling while fullscreen
  document.body.style.overflow = isFs ? 'hidden' : '';
  // Recalculate sizes when entering/exiting fullscreen
  setTimeout(adjustCanvasSize, 80);
});

requestAnimationFrame(frame);
