
let CHARTS = null;
// Change this path if you put the JSON elsewhere (e.g. "data/charts.json")
const CHARTS_JSON_URL = "charts.json";

async function loadCharts() {
  try {
    const res = await fetch(CHARTS_JSON_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${CHARTS_JSON_URL} (HTTP ${res.status})`);

    CHARTS = await res.json();

    // Enable chart/level UI now that we have data
    chartSel.disabled = false;
    levelSel.disabled = false;
    generateBtn.disabled = false;

    // Populate based on current chart selection
    populateLevelsForSelectedChart();
  } catch (err) {
    CHARTS = null;
    descEl.textContent = `Error loading charts: ${err.message}`;
    chartSel.disabled = true;
    levelSel.disabled = true;
    generateBtn.disabled = true;
  }
}

function populateLevelsForSelectedChart() {
  const c = chartSel.value;

  // Guard: charts not loaded yet
  if (!CHARTS || !CHARTS[c] || typeof CHARTS[c] !== "object") {
    levelSel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(Charts not loaded)";
    levelSel.appendChild(opt);
    levelSel.disabled = true;
    return;
  }

  const levelsObj = CHARTS[c];
  const levelKeys = Object.keys(levelsObj).sort();

  levelSel.innerHTML = "";

  if (levelKeys.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(No levels for this chart)";
    levelSel.appendChild(opt);
    levelSel.disabled = true;
  } else {
    levelSel.disabled = false;
    for (const lvl of levelKeys) {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = `Level ${lvl}`;
      levelSel.appendChild(opt);
    }
  }
}

function generateWorkoutSteps(chart, level) {
  const c = String(chart);
  const lvl = String(level).toUpperCase();

  if (!CHARTS[c]) {
    throw new Error(`Chart ${c} does not exist in CHARTS`);
  }
  if (!CHARTS[c][lvl]) {
    throw new Error(`Level ${lvl} does not exist in Chart ${c}`);
  }

  const steps = CHARTS[c][lvl];
  if (!Array.isArray(steps) || steps.length !== 5) {
    throw new Error(`Chart ${c} Level ${lvl} must contain exactly 5 steps`);
  }

  // Defensive copy + normalisation
  return steps.map((step, i) => {
    if (step == null || typeof step !== "object") {
      throw new Error(`Invalid step object at index ${i} for Chart ${c} Level ${lvl}`);
    }
    const seconds = Number(step.seconds);
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error(`Invalid seconds at step ${i+1} (Chart ${c} Level ${lvl})`);
    }
    return {
      seconds,
      number: step.number,
      image: step.image || "",
      description: step.description || ""
    };
  });
}

/**
 * ───────────────────────────────────────────────────────────────
 * 3) Countdown + sequencing engine (uses the generated steps)
 * ───────────────────────────────────────────────────────────────
 */
let steps = [];              // will be set by Generate button
let currentIndex = 0;
let remaining = 0;
let intervalId = null;
let running = false;

const timerEl = document.getElementById("timer");
const numEl   = document.getElementById("number");
const imgEl   = document.getElementById("image");
const descEl  = document.getElementById("desc");
const stepLabelEl = document.getElementById("stepLabel");
const chartLevelLabelEl = document.getElementById("chartLevelLabel");

const chartSel = document.getElementById("chartSel");
const levelSel = document.getElementById("levelSel");

const generateBtn = document.getElementById("generateBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const skipBtn  = document.getElementById("skipBtn");
const resetBtn = document.getElementById("resetBtn");

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}

function renderStep(index) {
  const step = steps[index];
  if (!step) return;

  remaining = step.seconds;

  timerEl.textContent = formatTime(remaining);
  numEl.textContent   = step.number;
  descEl.textContent  = step.description;

  imgEl.src = step.image || "";
  imgEl.style.display = step.image ? "block" : "none";

  stepLabelEl.textContent = `Step ${index + 1} / ${steps.length}`;
}

function tick() {
  remaining -= 1;
  timerEl.textContent = formatTime(remaining);
  if (remaining <= 0) advance();
}

function start() {
  if (running || steps.length !== 5) return;
  running = true;

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  skipBtn.disabled  = false;

  intervalId = setInterval(tick, 1000);
}

function pause() {
  if (!running) return;
  running = false;

  clearInterval(intervalId);
  intervalId = null;

  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function stopAndClearInterval() {
  running = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function advance() {
  stopAndClearInterval();

  currentIndex += 1;
  if (currentIndex >= steps.length) {
    timerEl.textContent = "00:00";
    numEl.textContent = "Done";
    descEl.textContent = "Sequence complete.";
    imgEl.style.display = "none";
    stepLabelEl.textContent = `Step ${steps.length} / ${steps.length}`;
    skipBtn.disabled = true;
    return;
  }

  renderStep(currentIndex);
  start(); // auto-start next step
}

function resetSequence() {
  stopAndClearInterval();
  currentIndex = 0;
  renderStep(currentIndex);
  skipBtn.disabled = false;
}

/**
 * ───────────────────────────────────────────────────────────────
 * 4) Wire chart → available levels list (auto-populate)
 * ───────────────────────────────────────────────────────────────
 */
function populateLevelsForSelectedChart() {
  const c = chartSel.value;
  const levelsObj = CHARTS[c] || {};
  const levelKeys = Object.keys(levelsObj).sort();

  levelSel.innerHTML = "";
  if (levelKeys.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(No levels loaded)";
    levelSel.appendChild(opt);
    levelSel.disabled = true;
  } else {
    levelSel.disabled = false;
    for (const lvl of levelKeys) {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = `Level ${lvl}`;
      levelSel.appendChild(opt);
    }
  }
}

chartSel.addEventListener("change", () => {
  populateLevelsForSelectedChart();
  // clear any previous generated sequence
  steps = [];
  currentIndex = 0;
  timerEl.textContent = "00:00";
  numEl.textContent = "—";
  imgEl.style.display = "none";
  descEl.textContent = "Select a chart and level, then click “Generate 5 steps”.";
  stepLabelEl.textContent = "Step 0 / 5";
  chartLevelLabelEl.textContent = `Chart ${chartSel.value} Level —`;
  startBtn.disabled = true;
  pauseBtn.disabled = true;
  skipBtn.disabled = true;
  resetBtn.disabled = true;
});

generateBtn.addEventListener("click", () => {
  try {
    const c = chartSel.value;
    const lvl = levelSel.value;
    const generated = generateWorkoutSteps(c, lvl);

    // Assign the 5 JSON variables (as you originally structured it)
    // They are available here if you need them explicitly:
    const step1 = generated[0];
    const step2 = generated[1];
    const step3 = generated[2];
    const step4 = generated[3];
    const step5 = generated[4];
    // (Not used directly; kept because you asked for “5 JSON variables”.)

    steps = generated;
    currentIndex = 0;
    renderStep(currentIndex);

    chartLevelLabelEl.textContent = `Chart ${c} Level ${lvl}`;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    skipBtn.disabled = false;
    resetBtn.disabled = false;

    descEl.textContent = steps[0].description || "(No description)";
  } catch (err) {
    // Minimal on-page error display (no alerts)
    steps = [];
    currentIndex = 0;
    stopAndClearInterval();
    timerEl.textContent = "00:00";
    numEl.textContent = "—";
    imgEl.style.display = "none";
    stepLabelEl.textContent = "Step 0 / 5";
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    skipBtn.disabled = true;
    resetBtn.disabled = true;
    descEl.textContent = `Error: ${err.message}`;
  }
});

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
skipBtn.addEventListener("click", () => { if (steps.length === 5) advance(); });
resetBtn.addEventListener("click", () => { if (steps.length === 5) resetSequence(); });


// Initial boot (load JSON first, then populate levels)
chartLevelLabelEl.textContent = `Chart ${chartSel.value} Level —`;
loadCharts();

