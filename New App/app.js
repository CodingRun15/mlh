const COLUMNS = ["todo", "doing", "done"];
const COLUMN_LABEL = {
  todo: "To Do",
  doing: "In Progress",
  done: "Done",
};

const TITLE_MIN = 3;
const TITLE_MAX = 80;

const state = {
  nextId: 4,
  cards: [
    { id: 1, title: "Cut the hero down to one sentence", column: "todo" },
    { id: 2, title: "Record a 20-second demo", column: "doing" },
    { id: 3, title: "Kill the settings page nobody uses", column: "done" },
  ],
  filters: {
    query: "",
    lane: "all",
  },
};

const form = document.querySelector("#add-form");
const titleInput = document.querySelector("#card-title");
const errorEl = document.querySelector("#title-error");
const searchInput = document.querySelector("#search");
const filterStatus = document.querySelector("#filter-status");
const statsEl = document.querySelector("#board-stats");

function normalizeTitle(raw) {
  return String(raw ?? "").trim().replace(/\s+/g, " ");
}

function validateTitle(raw) {
  const title = normalizeTitle(raw);

  if (!title) {
    return { ok: false, error: "Name the card. Blank tickets get shredded." };
  }
  if (title.length < TITLE_MIN) {
    return { ok: false, error: `Too short. Need at least ${TITLE_MIN} characters.` };
  }
  if (title.length > TITLE_MAX) {
    return { ok: false, error: `Too long. Cap is ${TITLE_MAX} characters.` };
  }
  if (!/[a-zA-Z0-9]/.test(title)) {
    return { ok: false, error: "Needs a letter or number — punctuation-only is noise." };
  }
  const taken = state.cards.some(
    (card) => card.title.toLowerCase() === title.toLowerCase()
  );
  if (taken) {
    return { ok: false, error: "Already on the board. Change it or move the original." };
  }

  return { ok: true, title };
}

function showError(message) {
  errorEl.hidden = !message;
  errorEl.textContent = message ?? "";
  titleInput.setAttribute("aria-invalid", message ? "true" : "false");
}

function matchesFilters(card) {
  const { query, lane } = state.filters;
  const laneOk = lane === "all" || card.column === lane;
  const queryOk = !query || card.title.toLowerCase().includes(query);
  return laneOk && queryOk;
}

function moveColumn(column, direction) {
  const index = COLUMNS.indexOf(column);
  return COLUMNS[index + direction] ?? column;
}

function padId(id) {
  return String(id).padStart(3, "0");
}

function renderCard(card) {
  const item = document.createElement("li");
  const canLeft = card.column !== "todo";
  const canRight = card.column !== "done";

  item.innerHTML = `
    <article class="card">
      <div class="card__spine" aria-hidden="true"></div>
      <div class="card__body">
        <div class="card__meta">
          <span>#${padId(card.id)}</span>
          <span>${COLUMN_LABEL[card.column]}</span>
        </div>
        <h3>${escapeHtml(card.title)}</h3>
        <div class="card__actions">
          <button class="btn btn--ghost" type="button" data-action="left" ${canLeft ? "" : "disabled"}>
            ← Back
          </button>
          <button class="btn btn--ghost" type="button" data-action="right" ${canRight ? "" : "disabled"}>
            Next →
          </button>
          <button class="btn btn--kill" type="button" data-action="kill" aria-label="Delete ${escapeHtml(card.title)}">
            Kill
          </button>
        </div>
      </div>
    </article>
  `;

  item.querySelector("[data-action='left']").addEventListener("click", () => {
    card.column = moveColumn(card.column, -1);
    render();
  });
  item.querySelector("[data-action='right']").addEventListener("click", () => {
    card.column = moveColumn(card.column, 1);
    render();
  });
  item.querySelector("[data-action='kill']").addEventListener("click", () => {
    state.cards = state.cards.filter((entry) => entry.id !== card.id);
    render();
  });

  return item;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function render() {
  const visible = state.cards.filter(matchesFilters);

  for (const column of COLUMNS) {
    const list = document.querySelector(`[data-list="${column}"]`);
    const lane = document.querySelector(`[data-lane="${column}"]`);
    const count = document.querySelector(`[data-count="${column}"]`);
    const inLane = visible.filter((card) => card.column === column);

    list.replaceChildren();
    count.textContent = String(inLane.length);
    lane.classList.toggle(
      "is-dim",
      state.filters.lane !== "all" && state.filters.lane !== column
    );

    if (inLane.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent =
        state.cards.some((card) => card.column === column)
          ? "Hidden by filters."
          : "Lane is empty. Slam something in.";
      list.append(empty);
    } else {
      inLane.forEach((card) => list.append(renderCard(card)));
    }
  }

  const noun = state.cards.length === 1 ? "card" : "cards";
  statsEl.textContent = `${state.cards.length} ${noun} on deck`;

  const hidden = state.cards.length - visible.length;
  if (!state.filters.query && state.filters.lane === "all") {
    filterStatus.textContent = "";
  } else if (visible.length === 0) {
    filterStatus.textContent = "Filters ate the board. Loosen the search or lane.";
  } else {
    filterStatus.textContent = `Showing ${visible.length} of ${state.cards.length}. ${hidden} hidden.`;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = validateTitle(titleInput.value);

  if (!result.ok) {
    showError(result.error);
    titleInput.focus();
    return;
  }

  state.cards.push({
    id: state.nextId,
    title: result.title,
    column: "todo",
  });
  state.nextId += 1;
  titleInput.value = "";
  showError("");
  render();
  titleInput.focus();
});

titleInput.addEventListener("input", () => {
  if (!errorEl.hidden) {
    const result = validateTitle(titleInput.value);
    showError(result.ok || !normalizeTitle(titleInput.value) ? "" : result.error);
  }
});

searchInput.addEventListener("input", () => {
  state.filters.query = normalizeTitle(searchInput.value).toLowerCase();
  render();
});

document.querySelectorAll("input[name='lane']").forEach((radio) => {
  radio.addEventListener("change", () => {
    state.filters.lane = radio.value;
    render();
  });
});

render();
