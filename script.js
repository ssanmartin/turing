const presets = {
  unario: {
    tape: "111",
    blank: "_",
    start: "q0",
    accept: "qf",
    reject: "qr",
    transitions: `q0,1 -> 1,R,q0
q0,_ -> 1,S,qf`,
  },
  paridad: {
    tape: "1111",
    blank: "_",
    start: "qPar",
    accept: "qf",
    reject: "qr",
    transitions: `qPar,1 -> 1,R,qImpar
qImpar,1 -> 1,R,qPar
qPar,_ -> _,S,qf
qImpar,_ -> _,S,qr`,
  },
};

const els = {
  preset: document.getElementById("presetSelect"),
  tapeInput: document.getElementById("tapeInput"),
  blankInput: document.getElementById("blankInput"),
  startInput: document.getElementById("startStateInput"),
  acceptInput: document.getElementById("acceptInput"),
  rejectInput: document.getElementById("rejectInput"),
  transitionsInput: document.getElementById("transitionsInput"),
  loadBtn: document.getElementById("loadBtn"),
  resetBtn: document.getElementById("resetBtn"),
  stepBtn: document.getElementById("stepBtn"),
  runBtn: document.getElementById("runBtn"),
  currentState: document.getElementById("currentState"),
  stepCount: document.getElementById("stepCount"),
  result: document.getElementById("result"),
  tapeContainer: document.getElementById("tapeContainer"),
  history: document.getElementById("history"),
};

let machine;

function parseTransitions(text) {
  const map = new Map();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const [left, right] = line.split("->").map((part) => part && part.trim());
    if (!left || !right) throw new Error(`Transición inválida: ${line}`);

    const [state, read] = left.split(",").map((p) => p.trim());
    const [write, move, next] = right.split(",").map((p) => p.trim());
    if (!state || !read || !write || !move || !next) {
      throw new Error(`Formato incompleto: ${line}`);
    }

    const direction = move.toUpperCase();
    if (!["L", "R", "S"].includes(direction)) {
      throw new Error(`Movimiento inválido (${move}) en: ${line}`);
    }

    map.set(`${state}|${read}`, { write, move: direction, next });
  }

  return map;
}

function buildMachine() {
  const blank = els.blankInput.value || "_";
  const tapeRaw = els.tapeInput.value;
  const tape = new Map();
  for (let i = 0; i < tapeRaw.length; i += 1) tape.set(i, tapeRaw[i]);

  machine = {
    tape,
    head: 0,
    state: els.startInput.value.trim(),
    accept: els.acceptInput.value.trim(),
    reject: els.rejectInput.value.trim(),
    blank,
    transitions: parseTransitions(els.transitionsInput.value),
    halted: false,
    result: "En ejecución",
    steps: 0,
  };

  clearHistory();
  logHistory("Máquina cargada. Lista para iniciar.");
  render();
}

function readCell(index) {
  return machine.tape.has(index) ? machine.tape.get(index) : machine.blank;
}

function writeCell(index, symbol) {
  if (symbol === machine.blank) {
    machine.tape.delete(index);
    return;
  }
  machine.tape.set(index, symbol);
}

function step() {
  if (!machine || machine.halted) return;

  if (machine.state === machine.accept) {
    machine.halted = true;
    machine.result = "Aceptada";
    logHistory("La máquina alcanzó el estado de aceptación.");
    render();
    return;
  }

  if (machine.reject && machine.state === machine.reject) {
    machine.halted = true;
    machine.result = "Rechazada";
    logHistory("La máquina alcanzó el estado de rechazo.");
    render();
    return;
  }

  const read = readCell(machine.head);
  const key = `${machine.state}|${read}`;
  const transition = machine.transitions.get(key);

  if (!transition) {
    machine.halted = true;
    machine.result = "Rechazada (sin transición)";
    logHistory(`No existe transición para (${machine.state}, ${read}).`);
    render();
    return;
  }

  writeCell(machine.head, transition.write);
  const oldHead = machine.head;

  if (transition.move === "R") machine.head += 1;
  if (transition.move === "L") machine.head -= 1;

  const oldState = machine.state;
  machine.state = transition.next;
  machine.steps += 1;

  logHistory(
    `Paso ${machine.steps}: (${oldState}, ${read}) → (${transition.write}, ${transition.move}, ${transition.next}). Cabezal: ${oldHead} → ${machine.head}`,
  );

  render();
}

function run(maxSteps = 20) {
  for (let i = 0; i < maxSteps && machine && !machine.halted; i += 1) {
    step();
  }
}

function clearHistory() {
  els.history.innerHTML = "";
}

function logHistory(text) {
  const item = document.createElement("li");
  item.textContent = text;
  els.history.appendChild(item);
}

function render() {
  if (!machine) return;

  els.currentState.textContent = machine.state;
  els.stepCount.textContent = String(machine.steps);
  els.result.textContent = machine.result;
  els.result.className = "";

  if (machine.result.startsWith("Aceptada")) els.result.classList.add("result-accept");
  else if (machine.result.startsWith("Rechazada"))
    els.result.classList.add("result-reject");
  else els.result.classList.add("result-running");

  const indices = [...machine.tape.keys(), machine.head];
  const min = Math.min(...indices, -5);
  const max = Math.max(...indices, 5);

  els.tapeContainer.innerHTML = "";
  for (let i = min; i <= max; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (i === machine.head) cell.classList.add("head");
    cell.innerHTML = `<div>${readCell(i)}</div><small>${i}</small>`;
    els.tapeContainer.appendChild(cell);
  }
}

els.preset.addEventListener("change", () => {
  const p = presets[els.preset.value];
  if (!p) return;

  els.tapeInput.value = p.tape;
  els.blankInput.value = p.blank;
  els.startInput.value = p.start;
  els.acceptInput.value = p.accept;
  els.rejectInput.value = p.reject;
  els.transitionsInput.value = p.transitions;
});

els.loadBtn.addEventListener("click", () => {
  try {
    buildMachine();
  } catch (error) {
    alert(`Error al cargar: ${error.message}`);
  }
});

els.resetBtn.addEventListener("click", () => {
  try {
    buildMachine();
  } catch (error) {
    alert(`Error al reiniciar: ${error.message}`);
  }
});

els.stepBtn.addEventListener("click", step);
els.runBtn.addEventListener("click", () => run(20));

buildMachine();
