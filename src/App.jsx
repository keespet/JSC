import { useEffect, useMemo, useRef, useState } from "react";
import { EXERCISES } from "./data/exercises.js";
import { SOURCE_META } from "./data/sourceMeta.js";
import { calculateResults, formatNumber, parseMethod } from "./logic/calculations.js";
import { clearDraft, loadDraft, saveDraft } from "./logic/storage.js";
import { isSyncConfigured, sendToN8n } from "./logic/sync.js";

const SLOT_COUNT = 15;
const TYPES = [
  { value: "normal", label: "kg" },
  { value: "keer", label: "keer" },
  { value: "keiser", label: "keiser" },
  { value: "graden", label: "graden" },
];

function blankSlot(id) {
  return {
    id,
    exercise: null,
    note: "",
    type: "normal",
    hasRight: false,
    hhL: "",
    kgL: "",
    hhR: "",
    kgR: "",
    wattL: "",
    wattR: "",
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDraft() {
  return {
    athlete: "",
    date: today(),
    phase: 1,
    bodyFat: "",
    slots: Array.from({ length: SLOT_COUNT }, (_, index) => blankSlot(index + 1)),
    overrides: {
      strongReps: "",
      strongPct: "",
      strongSets: "",
      strongPause: "60",
      weakReps: "",
      weakPct: "",
      weakSets: "",
      weakPause: "60",
    },
  };
}

function mergeDraft(value) {
  if (!value) return defaultDraft();
  const base = defaultDraft();
  return {
    ...base,
    ...value,
    overrides: { ...base.overrides, ...(value.overrides || {}) },
    slots: Array.from({ length: SLOT_COUNT }, (_, index) => ({ ...blankSlot(index + 1), ...(value.slots?.[index] || {}) })),
  };
}

export default function App() {
  const [draft, setDraft] = useState(() => mergeDraft(loadDraft()));
  const [screen, setScreen] = useState("input");
  const [pickerSlot, setPickerSlot] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const importRef = useRef(null);

  const results = useMemo(
    () => calculateResults({ slots: draft.slots, phase: draft.phase, overrides: draft.overrides }),
    [draft.slots, draft.phase, draft.overrides]
  );

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const filled = draft.slots.filter((slot) => slot.exercise && (slot.hhL || slot.kgL || slot.hhR || slot.kgR)).length;

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateOverrides(patch) {
    setDraft((current) => ({ ...current, overrides: { ...current.overrides, ...patch } }));
  }

  function updateSlot(id, patch) {
    setDraft((current) => ({
      ...current,
      slots: current.slots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)),
    }));
  }

  function chooseExercise(exercise) {
    if (!pickerSlot) return;
    updateSlot(pickerSlot, { exercise });
    setPickerSlot(null);
  }

  function resetDraft() {
    if (!window.confirm("Nieuw formulier starten?")) return;
    clearDraft();
    setDraft(defaultDraft());
    setScreen("input");
  }

  async function saveToServer() {
    setSaveState("saving");
    try {
      await sendToN8n(draft);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2500);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      window.setTimeout(() => setSaveState("idle"), 4000);
    }
  }

  function exportDraft() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: SOURCE_META,
      draft,
      summary: {
        averageDifference: results.averageDifference,
        strongMethod: results.strongMethod,
        weakMethod: results.weakMethod,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jsc-${draft.athlete || "schema"}-${draft.date || today()}.json`.replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  }

  function importDraft(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        setDraft(mergeDraft(data.draft || data));
      } catch {
        window.alert("Dit bestand kan niet worden ingelezen.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand">JSC</div>
          <div className="brand-sub">Toptraining</div>
        </div>
        <div className="header-actions">
          <button className="ghost-button" onClick={() => importRef.current?.click()}>
            Import
          </button>
          <button className="ghost-button" onClick={exportDraft}>
            Export
          </button>
          {isSyncConfigured() && (
            <button className="ghost-button" onClick={saveToServer} disabled={saveState === "saving"}>
              {saveState === "saving"
                ? "Opslaan…"
                : saveState === "saved"
                ? "Opgeslagen ✓"
                : saveState === "error"
                ? "Mislukt ✕"
                : "Opslaan"}
            </button>
          )}
        </div>
      </header>

      <input ref={importRef} className="hidden-input" type="file" accept="application/json" onChange={importDraft} />

      <nav className="tabs" aria-label="Schermen">
        <button className={screen === "input" ? "active" : ""} onClick={() => setScreen("input")}>
          Invoer
        </button>
        <button className={screen === "results" ? "active" : ""} onClick={() => setScreen("results")}>
          Schema
        </button>
        <button className={screen === "data" ? "active" : ""} onClick={() => setScreen("data")}>
          Controle
        </button>
      </nav>

      {screen === "input" && (
        <InputScreen
          draft={draft}
          filled={filled}
          updateDraft={updateDraft}
          updateSlot={updateSlot}
          openPicker={setPickerSlot}
          onResults={() => setScreen("results")}
          onReset={resetDraft}
        />
      )}

      {screen === "results" && (
        <ResultsScreen draft={draft} results={results} updateOverrides={updateOverrides} onBack={() => setScreen("input")} />
      )}

      {screen === "data" && <DataScreen />}

      {pickerSlot && <ExercisePicker onClose={() => setPickerSlot(null)} onChoose={chooseExercise} />}
    </div>
    <PrintSchema draft={draft} results={results} />
    </>
  );
}

function trainingWeight(training) {
  if (!training || training.kg === null || training.kg === undefined) return "-";
  const value = `${formatNumber(training.kg, training.unit ? 0 : 1)} ${training.unit || "kg"}`;
  return training.watt ? `${value} · ${formatNumber(training.watt, 0)}w` : value;
}

function sidePause(draft, role) {
  return (role === "zwak" ? draft.overrides.weakPause : draft.overrides.strongPause) || "60";
}

function PrintSchema({ draft, results }) {
  const items = results.exercises.filter((item) => item.exercise && (item.trainingL || item.trainingR));
  return (
    <div className="print-doc">
      <div className="print-head">
        <div>
          <div className="print-brand">JSC · Trainingsschema</div>
          <div className="print-sub">Toptraining</div>
        </div>
        <div className="print-meta">
          <div><span>Sporter</span><strong>{draft.athlete || "-"}</strong></div>
          <div><span>Datum</span><strong>{draft.date || "-"}</strong></div>
          <div><span>Fase</span><strong>{draft.phase}</strong></div>
        </div>
      </div>

      <div className="print-methods">
        <span>Sterk: {results.strongMethod || "-"} · {results.strongSets || "-"} · {draft.overrides.strongPause || "60"}s</span>
        <span>Zwak: {results.weakMethod || "-"} · {results.weakSets || "-"} · {draft.overrides.weakPause || "60"}s</span>
      </div>

      {items.length === 0 ? (
        <p className="print-empty">Nog geen ingevulde oefeningen.</p>
      ) : (
        <table className="print-table">
          <thead>
            <tr>
              <th>Nr</th>
              <th>Oefening</th>
              <th>Zijde</th>
              <th>HH</th>
              <th>Gewicht</th>
              <th>Sets</th>
              <th>Pauze</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sides =
                item.hasRight && item.trainingR
                  ? [
                      { key: "L", role: item.leftRole, training: item.trainingL },
                      { key: "R", role: item.rightRole, training: item.trainingR },
                    ]
                  : [{ key: "", role: item.leftRole, training: item.trainingL }];
              return sides.map((side, index) => (
                <tr key={`${item.id}-${side.key || "x"}`}>
                  <td>{index === 0 ? item.exercise.nr : ""}</td>
                  <td>{index === 0 ? item.exercise.name : ""}</td>
                  <td>{`${side.key ? side.key + " " : ""}${side.role === "zwak" ? "Z" : "S"}`}</td>
                  <td>{side.training ? side.training.repetitions : "-"}</td>
                  <td>{trainingWeight(side.training)}</td>
                  <td>{side.training?.sets || ""}</td>
                  <td>{sidePause(draft, side.role)}s</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      )}

      <div className="print-footer">S = sterke zijde · Z = zwakke zijde</div>
    </div>
  );
}

function InputScreen({ draft, filled, updateDraft, updateSlot, openPicker, onResults, onReset }) {
  return (
    <main className="screen">
      <section className="panel form-grid">
        <label>
          <span>Naam</span>
          <input value={draft.athlete} onChange={(event) => updateDraft({ athlete: event.target.value })} placeholder="Naam sporter" />
        </label>
        <label>
          <span>Datum</span>
          <input type="date" value={draft.date} onChange={(event) => updateDraft({ date: event.target.value })} />
        </label>
        <label>
          <span>Fase</span>
          <select value={draft.phase} onChange={(event) => updateDraft({ phase: Number(event.target.value) })}>
            {[1, 2, 3, 4, 5, 6].map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Vetpercentage</span>
          <input value={draft.bodyFat} onChange={(event) => updateDraft({ bodyFat: event.target.value })} inputMode="decimal" />
        </label>
      </section>

      <div className="section-title">
        <span>Testresultaten</span>
        <strong>{filled}</strong>
      </div>

      <section className="slot-list">
        {draft.slots.map((slot, index) => (
          <SlotCard key={slot.id} slot={slot} index={index} updateSlot={updateSlot} openPicker={openPicker} />
        ))}
      </section>

      <div className="bottom-bar">
        <button className="secondary-button" onClick={onReset}>
          Nieuw
        </button>
        <button className="primary-button" onClick={onResults}>
          Schema bekijken
        </button>
      </div>
    </main>
  );
}

function SlotCard({ slot, index, updateSlot, openPicker }) {
  const reviewCount = slot.exercise?.reviewNotes?.length || 0;
  return (
    <details className="slot-card" open={index < 2 || Boolean(slot.exercise)}>
      <summary>
        <span className="slot-number">{slot.exercise?.nr || slot.id}</span>
        <span className="slot-name">{slot.exercise?.name || "Oefening kiezen"}</span>
        {reviewCount > 0 && <span className="review-pill">{reviewCount}</span>}
      </summary>
      <div className="slot-body">
        <button className="picker-button" onClick={() => openPicker(slot.id)}>
          {slot.exercise ? `${slot.exercise.nr}. ${slot.exercise.name}` : "Oefening kiezen"}
        </button>
        {slot.exercise && (
          <div className="exercise-meta">
            <span>{slot.exercise.category || "zonder categorie"}</span>
            {slot.exercise.muscle && <span>{slot.exercise.muscle}</span>}
          </div>
        )}
        {slot.exercise?.reviewNotes?.length > 0 && (
          <div className="review-note">{slot.exercise.reviewNotes.join(" ")}</div>
        )}

        <label>
          <span>Notitie</span>
          <input value={slot.note} onChange={(event) => updateSlot(slot.id, { note: event.target.value })} placeholder="bijv. st 7" />
        </label>

        <div className="segmented">
          {TYPES.map((type) => (
            <button
              key={type.value}
              className={slot.type === type.value ? "active" : ""}
              onClick={() => updateSlot(slot.id, { type: type.value })}
            >
              {type.label}
            </button>
          ))}
          <button className={slot.hasRight ? "active blue" : ""} onClick={() => updateSlot(slot.id, { hasRight: !slot.hasRight })}>
            R
          </button>
        </div>

        <SideInputs title="Links" slot={slot} side="L" updateSlot={updateSlot} />
        {slot.hasRight && <SideInputs title="Rechts" slot={slot} side="R" updateSlot={updateSlot} />}
      </div>
    </details>
  );
}

function SideInputs({ title, slot, side, updateSlot }) {
  const suffix = side === "L" ? "L" : "R";
  return (
    <fieldset className="side-fieldset">
      <legend>{title}</legend>
      <label>
        <span>HH</span>
        <input
          inputMode="decimal"
          value={slot[`hh${suffix}`]}
          onChange={(event) => updateSlot(slot.id, { [`hh${suffix}`]: event.target.value })}
        />
      </label>
      <label>
        <span>{slot.type === "graden" ? "Graden" : "KG"}</span>
        <input
          inputMode="decimal"
          value={slot[`kg${suffix}`]}
          onChange={(event) => updateSlot(slot.id, { [`kg${suffix}`]: event.target.value })}
        />
      </label>
      {slot.type === "keiser" && (
        <label>
          <span>Watt</span>
          <input
            inputMode="decimal"
            value={slot[`watt${suffix}`]}
            onChange={(event) => updateSlot(slot.id, { [`watt${suffix}`]: event.target.value })}
          />
        </label>
      )}
    </fieldset>
  );
}

function ResultsScreen({ draft, results, updateOverrides, onBack }) {
  return (
    <main className="screen">
      <section className="panel result-header">
        <div>
          <span className="muted">Sporter</span>
          <strong>{draft.athlete || "-"}</strong>
        </div>
        <div>
          <span className="muted">Fase</span>
          <strong>{draft.phase}</strong>
        </div>
        <div>
          <span className="muted">Verschil</span>
          <strong>{Math.round(results.averageDifference * 100)}%</strong>
        </div>
        {draft.bodyFat && (
          <div>
            <span className="muted">Vet</span>
            <strong>{draft.bodyFat}%</strong>
          </div>
        )}
      </section>

      <MethodEditor draft={draft} results={results} updateOverrides={updateOverrides} />

      <section className="result-list">
        {results.exercises
          .filter((item) => item.exercise)
          .map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
      </section>

      <div className="bottom-bar">
        <button className="secondary-button" onClick={onBack}>
          Aanpassen
        </button>
        <button className="primary-button" onClick={() => window.print()}>
          PDF / Afdrukken
        </button>
      </div>
    </main>
  );
}

function MethodEditor({ draft, results, updateOverrides }) {
  const strongParsed = parseMethod(results.autoStrongMethod);
  const weakParsed = parseMethod(results.autoWeakMethod);
  return (
    <section className="panel method-panel">
      <MethodRow
        label="Sterk"
        method={results.strongMethod}
        sets={results.strongSets}
        pause={draft.overrides.strongPause}
        reps={draft.overrides.strongReps}
        pct={draft.overrides.strongPct}
        setsValue={draft.overrides.strongSets}
        placeholders={{
          reps: strongParsed?.repetitions || "",
          pct: strongParsed?.percentage ? Math.round(strongParsed.percentage * 100) : "",
          sets: results.strongSets.replace("X", ""),
        }}
        onChange={(patch) => updateOverrides(Object.fromEntries(Object.entries(patch).map(([key, value]) => [`strong${key}`, value])))}
      />
      <MethodRow
        label="Zwak"
        method={results.weakMethod}
        sets={results.weakSets}
        pause={draft.overrides.weakPause}
        reps={draft.overrides.weakReps}
        pct={draft.overrides.weakPct}
        setsValue={draft.overrides.weakSets}
        placeholders={{
          reps: weakParsed?.repetitions || "",
          pct: weakParsed?.percentage ? Math.round(weakParsed.percentage * 100) : "",
          sets: results.weakSets.replace("X", ""),
        }}
        onChange={(patch) => updateOverrides(Object.fromEntries(Object.entries(patch).map(([key, value]) => [`weak${key}`, value])))}
      />
    </section>
  );
}

function MethodRow({ label, method, sets, pause, reps, pct, setsValue, placeholders, onChange }) {
  return (
    <div className="method-row">
      <div className="method-title">
        <strong>{label}</strong>
        <span>
          {method || "-"} · {sets || "-"} · {pause || "60"}s
        </span>
      </div>
      <div className="method-inputs">
        <label>
          <span>HH</span>
          <input value={reps} placeholder={String(placeholders.reps)} onChange={(event) => onChange({ Reps: event.target.value })} />
        </label>
        <label>
          <span>%</span>
          <input value={pct} placeholder={String(placeholders.pct)} onChange={(event) => onChange({ Pct: event.target.value })} />
        </label>
        <label>
          <span>Sets</span>
          <input value={setsValue.replace(/\D/g, "")} placeholder={placeholders.sets} onChange={(event) => onChange({ Sets: event.target.value })} />
        </label>
        <label>
          <span>Pauze</span>
          <input value={pause} placeholder="60" onChange={(event) => onChange({ Pause: event.target.value })} />
        </label>
      </div>
    </div>
  );
}

function ResultCard({ item }) {
  const difference = item.difference === null ? null : Math.round(item.difference * 100);
  return (
    <article className="result-card">
      <div className="result-title">
        <span className="slot-number">{item.exercise.nr}</span>
        <strong>{item.exercise.name}</strong>
        {difference !== null && <span className={difference > 5 ? "diff warn" : "diff"}>{difference}%</span>}
      </div>
      <div className="result-table">
        <ResultRow label="Test L" reps={item.hhLn} kg={item.kgLn} oneRm={item.oneRmL} />
        {item.hasRight && <ResultRow label="Test R" reps={item.hhRn} kg={item.kgRn} oneRm={item.oneRmR} />}
        {item.trainingL && <TrainingRow label={`Train L ${item.leftRole === "zwak" ? "Z" : "S"}`} training={item.trainingL} />}
        {item.trainingR && <TrainingRow label={`Train R ${item.rightRole === "zwak" ? "Z" : "S"}`} training={item.trainingR} />}
      </div>
      {item.note && <p className="card-note">{item.note}</p>}
    </article>
  );
}

function ResultRow({ label, reps, kg, oneRm }) {
  return (
    <div className="table-row">
      <span>{label}</span>
      <span>{reps ?? "-"}</span>
      <span>{kg ?? "-"}</span>
      <span>{formatNumber(oneRm, 2) || "-"}</span>
    </div>
  );
}

function TrainingRow({ label, training }) {
  const kgLabel = training.kg === null ? "-" : `${formatNumber(training.kg, training.unit ? 0 : 1)} ${training.unit || "kg"}`;
  const wattLabel = training.watt ? ` · ${formatNumber(training.watt, 0)}w` : "";
  return (
    <div className="table-row train">
      <span>{label}</span>
      <span>{training.repetitions}</span>
      <span>{kgLabel}</span>
      <span>{training.sets || ""}{wattLabel}</span>
    </div>
  );
}

function ExercisePicker({ onClose, onChoose }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("alle");
  const [reviewOnly, setReviewOnly] = useState(false);
  const categories = useMemo(() => ["alle", ...new Set(EXERCISES.map((exercise) => exercise.category).filter(Boolean)).values()], []);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return EXERCISES.filter((exercise) => {
      const matchesCategory = category === "alle" || exercise.category === category;
      const matchesReview = !reviewOnly || exercise.reviewNotes?.length;
      const haystack = `${exercise.nr} ${exercise.name} ${exercise.category} ${exercise.muscle}`.toLowerCase();
      return matchesCategory && matchesReview && (!term || haystack.includes(term));
    }).slice(0, 80);
  }, [query, category, reviewOnly]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="picker-modal">
        <div className="picker-top">
          <strong>Oefening kiezen</strong>
          <button className="ghost-button" onClick={onClose}>
            Sluiten
          </button>
        </div>
        <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoeken" autoFocus />
        <div className="filter-row">
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <label className="check-row">
            <input type="checkbox" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} />
            <span>controle</span>
          </label>
        </div>
        <div className="exercise-list">
          {filtered.map((exercise) => (
            <button key={exercise.nr} onClick={() => onChoose(exercise)}>
              <span>{exercise.nr}</span>
              <strong>{exercise.name}</strong>
              <small>{exercise.category}</small>
              {exercise.reviewNotes?.length > 0 && <em>{exercise.reviewNotes.length}</em>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function DataScreen() {
  const reviewExercises = EXERCISES.filter((exercise) => exercise.reviewNotes?.length);
  const duplicateExercises = EXERCISES.filter((exercise) => exercise.duplicateNameGroup?.length);
  return (
    <main className="screen">
      <section className="panel data-stats">
        <div>
          <span className="muted">Oefeningen</span>
          <strong>{SOURCE_META.exerciseCount}</strong>
        </div>
        <div>
          <span className="muted">Controle</span>
          <strong>{reviewExercises.length}</strong>
        </div>
        <div>
          <span className="muted">Dubbel</span>
          <strong>{duplicateExercises.length}</strong>
        </div>
      </section>
      <section className="data-list">
        {reviewExercises.map((exercise) => (
          <article className="result-card" key={exercise.nr}>
            <div className="result-title">
              <span className="slot-number">{exercise.nr}</span>
              <strong>{exercise.name}</strong>
            </div>
            <p className="card-note">{exercise.reviewNotes.join(" ")}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
