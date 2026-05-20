const DATA = window.EVENT_DATA;

const els = {
  app: document.querySelector("#app"),
  eventTag: document.querySelector("#eventTag"),
  eventTitle: document.querySelector("#eventTitle"),
  eventSubtitle: document.querySelector("#eventSubtitle"),
  eventMeta: document.querySelector("#eventMeta"),
  focusTitle: document.querySelector("#focusTitle"),
  focusText: document.querySelector("#focusText"),
  progressBar: document.querySelector("#progressBar"),
  progressText: document.querySelector("#progressText"),
  startTime: document.querySelector("#startTime"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  resetBtn: document.querySelector("#resetBtn"),
  copySummaryBtn: document.querySelector("#copySummaryBtn"),
  printBtn: document.querySelector("#printBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  timeline: document.querySelector("#timeline"),
  timelineTemplate: document.querySelector("#timelineTemplate"),
  setlists: document.querySelector("#setlistsContainer"),
  introMessage: document.querySelector("#introMessage"),
  proposalIntro: document.querySelector("#proposalIntro"),
  activitiesContainer: document.querySelector("#activitiesContainer"),
  activityTableBody: document.querySelector("#activityTableBody"),
  placementContainer: document.querySelector("#placementContainer"),
  generalObjective: document.querySelector("#generalObjective"),
  extraIdeas: document.querySelector("#extraIdeas"),
  rolesList: document.querySelector("#rolesList"),
  risksList: document.querySelector("#risksList"),
  toast: document.querySelector("#toast")
};

const statusLabels = {
  pending: "Pendiente",
  active: "En curso",
  done: "Hecho",
  issue: "Alerta"
};

const typeLabels = {
  logistica: "Logística",
  show: "Presentación",
  actividad: "Actividad",
  pausa: "Pausa / transición"
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(DATA.storageKey);
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { items: {} };
  } catch (error) {
    console.warn("No se pudo cargar el estado local", error);
    return { items: {} };
  }
}

function saveState() {
  localStorage.setItem(DATA.storageKey, JSON.stringify(state));
}

function getItemState(id) {
  return state.items[id] || { status: "pending", note: "", checks: {} };
}

function setItemState(id, patch) {
  const current = getItemState(id);
  state.items[id] = { ...current, ...patch };
  saveState();
}

function debounce(fn, wait = 250) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

function init() {
  renderStaticInfo();
  renderTimeline();
  renderSetlists();
  renderProposal();
  renderRoles();
  bindEvents();
  updateProgress();
  showApp();
}

function renderStaticInfo() {
  els.eventTag.textContent = DATA.eventTag;
  els.eventTitle.textContent = DATA.eventTitle;
  els.eventSubtitle.textContent = DATA.eventSubtitle;
  els.focusTitle.textContent = DATA.mainFocus.title;
  els.focusText.textContent = DATA.mainFocus.text;
  els.startTime.textContent = DATA.startTime;
  els.introMessage.textContent = DATA.introMessage;

  els.eventMeta.innerHTML = "";
  DATA.contacts.forEach(item => {
    const pill = document.createElement("span");
    pill.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
    els.eventMeta.appendChild(pill);
  });
}

function renderTimeline() {
  const query = els.searchInput.value.trim().toLowerCase();
  const type = els.typeFilter.value;
  const status = els.statusFilter.value;

  els.timeline.innerHTML = "";
  const filtered = DATA.timeline.filter(item => {
    const itemState = getItemState(item.id);
    const haystack = [
      item.time,
      item.duration,
      item.type,
      item.title,
      item.owner,
      item.detail,
      ...(item.checklist || [])
    ].join(" ").toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesType = type === "all" || item.type === type;
    const matchesStatus = status === "all" || itemState.status === status;
    return matchesQuery && matchesType && matchesStatus;
  });

  if (!filtered.length) {
    els.timeline.innerHTML = `<article class="empty-state">No hay bloques que coincidan con los filtros actuales.</article>`;
    return;
  }

  filtered.forEach(item => {
    const node = els.timelineTemplate.content.cloneNode(true);
    const card = node.querySelector(".timeline-card");
    const itemState = getItemState(item.id);

    card.dataset.status = itemState.status;
    card.dataset.type = item.type;
    node.querySelector(".item-time").textContent = item.time;
    node.querySelector(".item-duration").textContent = item.duration;
    node.querySelector(".item-type").textContent = typeLabels[item.type] || item.type;
    node.querySelector(".item-owner").textContent = item.owner;
    node.querySelector(".item-title").textContent = item.title;
    node.querySelector(".item-detail").textContent = item.detail;

    const checklist = node.querySelector(".item-checklist");
    checklist.innerHTML = "";
    item.checklist.forEach((task, index) => {
      const taskId = `${item.id}-${index}`;
      const li = document.createElement("li");
      li.innerHTML = `
        <label class="check-row">
          <input type="checkbox" data-task-id="${taskId}" ${itemState.checks?.[taskId] ? "checked" : ""}>
          <span>${task}</span>
        </label>
      `;
      checklist.appendChild(li);
    });

    const note = node.querySelector(".item-note");
    const select = node.querySelector(".status-select");
    note.value = itemState.note || "";
    select.value = itemState.status || "pending";

    select.addEventListener("change", event => {
      setItemState(item.id, { status: event.target.value });
      renderTimeline();
      updateProgress();
    });

    note.addEventListener("input", debounce(() => {
      setItemState(item.id, { note: note.value });
    }, 250));

    checklist.addEventListener("change", event => {
      const input = event.target.closest("input[type='checkbox']");
      if (!input) return;
      const next = getItemState(item.id);
      next.checks = next.checks || {};
      next.checks[input.dataset.taskId] = input.checked;
      state.items[item.id] = next;
      saveState();
      updateProgress();
    });

    els.timeline.appendChild(node);
  });
}

function renderSetlists() {
  els.setlists.innerHTML = "";
  DATA.setlists.forEach(setlist => {
    const article = document.createElement("article");
    article.className = "setlist-card";
    article.innerHTML = `
      <h3>${setlist.band}</h3>
      <p>${setlist.note}</p>
      <ol>${setlist.songs.map(song => `<li>${song}</li>`).join("")}</ol>
    `;
    els.setlists.appendChild(article);
  });
}

function renderProposal() {
  els.proposalIntro.innerHTML = `
    <p class="eyebrow">${DATA.proposal.subtitle}</p>
    <h3>${DATA.proposal.title}</h3>
    <p>${DATA.proposal.intro}</p>
  `;

  els.activitiesContainer.innerHTML = "";
  DATA.activities.forEach((activity, index) => {
    const article = document.createElement("article");
    article.className = "activity-card";
    const sampleQuestions = activity.sampleQuestions?.length
      ? `<div class="sample-box"><h4>Ejemplos de preguntas</h4><ul>${activity.sampleQuestions.map(q => `<li>${q}</li>`).join("")}</ul></div>`
      : "";

    article.innerHTML = `
      <div class="activity-number">${String(index + 1).padStart(2, "0")}</div>
      <p class="mini-label">${activity.subtitle}</p>
      <h3>${activity.title}</h3>
      <div class="activity-section"><h4>Idea</h4><p>${activity.idea}</p></div>
      <div class="activity-section"><h4>Cómo funciona</h4><ul>${activity.how.map(step => `<li>${step}</li>`).join("")}</ul></div>
      ${sampleQuestions}
      <div class="activity-info-grid">
        <span><strong>Duración</strong>${activity.duration}</span>
        <span><strong>Participación</strong>${activity.participation}</span>
        <span><strong>Dificultad</strong>${activity.difficulty}</span>
      </div>
      <div class="activity-section"><h4>Elementos necesarios</h4><p>${activity.elements.join(", ")}</p></div>
      <div class="value-box"><strong>Valor para el evento:</strong> ${activity.value}</div>
    `;
    els.activitiesContainer.appendChild(article);
  });

  els.activityTableBody.innerHTML = DATA.activities.map(activity => `
    <tr>
      <td>${activity.title}</td>
      <td>${activity.duration}</td>
      <td>${activity.participation}</td>
      <td>${activity.difficulty}</td>
      <td>${activity.elements.join(", ")}</td>
    </tr>
  `).join("");

  els.placementContainer.innerHTML = DATA.proposal.placement.map(item => `
    <article>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");

  els.generalObjective.textContent = DATA.proposal.generalObjective;

  els.extraIdeas.innerHTML = DATA.extraIdeas.map(idea => `
    <article>
      <h3>${idea.title}</h3>
      <p>${idea.text}</p>
    </article>
  `).join("");
}

function renderRoles() {
  els.rolesList.innerHTML = DATA.roles.map(role => `<li>${role}</li>`).join("");
  els.risksList.innerHTML = DATA.risks.map(risk => `<li>${risk}</li>`).join("");
}

function updateProgress() {
  const total = DATA.timeline.length;
  const done = DATA.timeline.filter(item => getItemState(item.id).status === "done").length;
  const active = DATA.timeline.filter(item => getItemState(item.id).status === "active").length;
  const issues = DATA.timeline.filter(item => getItemState(item.id).status === "issue").length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  els.progressBar.style.width = `${percent}%`;
  els.progressText.textContent = `${done}/${total} bloques completados · ${active} en curso · ${issues} alerta(s)`;
}

function bindEvents() {
  [els.searchInput, els.typeFilter, els.statusFilter].forEach(control => {
    control.addEventListener("input", renderTimeline);
    control.addEventListener("change", renderTimeline);
  });

  els.copySummaryBtn.addEventListener("click", async () => {
    const summary = buildSummary();
    try {
      await navigator.clipboard.writeText(summary);
      toast("Resumen copiado.");
    } catch (error) {
      window.prompt("Copia el resumen manualmente:", summary);
    }
  });

  els.printBtn.addEventListener("click", () => window.print());

  els.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ event: DATA.eventTitle, exportedAt: new Date().toISOString(), state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "estado-salvemoslos-reggaeton-2026.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  els.resetBtn.addEventListener("click", () => {
    const ok = confirm("¿Reiniciar estados, notas y checklist del minuto a minuto?");
    if (!ok) return;
    state.items = {};
    saveState();
    renderTimeline();
    updateProgress();
    toast("Seguimiento reiniciado.");
  });
}

function buildSummary() {
  const lines = [
    `*${DATA.eventTitle}*`,
    `Inicio general: ${DATA.startTime}`,
    "Presentaciones Musicala: desde 2:00 p. m.",
    `Formato: ${DATA.venueType}`,
    `Temática: ${DATA.theme}`,
    "",
    "*Minuto a minuto:*"
  ];

  DATA.timeline.forEach(item => {
    const itemState = getItemState(item.id);
    const note = itemState.note ? ` · Nota: ${itemState.note}` : "";
    lines.push(`${statusIcon(itemState.status)} ${item.time} · ${item.title} · ${statusLabels[itemState.status]}${note}`);
  });

  lines.push("", "*Actividades propuestas:*");
  DATA.activities.forEach(activity => {
    lines.push(`• ${activity.title}: ${activity.duration}, participación ${activity.participation}, dificultad ${activity.difficulty}.`);
  });

  return lines.join("\n");
}

function statusIcon(status) {
  if (status === "done") return "✅";
  if (status === "active") return "🟣";
  if (status === "issue") return "⚠️";
  return "◻️";
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function showApp() {
  els.app.classList.remove("shell-hidden");
}

init();
