import React, { useCallback, useMemo, useState } from "react";
import { CheckCircle, CheckFilled, Calendar, ChevronDown, CrossCircle } from "./Icons";
import DischargeSummary from "./DischargeSummary";
import { SITE_OPTIONS, getDrugs, seedRecord } from "../data/patients";
import { fmt12, fmtDate, nowHHMM } from "../utils/time";
import { dayDate, dayKey, isFutureDay, isPastCycle, isPastDay, keyOf } from "../utils/schedule";
import { effective, needsEnd, touched, validate } from "../utils/admin";
import { VITAL_FIELDS } from "../utils/vitals";

const CONTROL = "input,select,button,label,textarea";

/* ------------------------------------------------------------- vitals strip */
function VitalsBar({ latest, onOpen }) {
  return (
    <div className="vitals-bar">
      <button type="button" className="link" onClick={onOpen}>Vitals</button>
      {latest ? (
        VITAL_FIELDS.map((f, i) => (
          <React.Fragment key={f.key}>
            {i > 0 && <i className="vitals-bar__sep" aria-hidden="true" />}
            <span className={latest.flags?.includes(f.key) ? "is-flag" : undefined}>{f.fmt(latest[f.key])}</span>
          </React.Fragment>
        ))
      ) : (
        <span className="vitals-bar__none">No vitals recorded</span>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- one drug row */
function DrugRow({ drug, rec, eff, state, errors, onActivate, onPatch, onSave, onClear, ui }) {
  const saved = state === "saved";
  const editable = state === "active" || state === "pending";
  const active = state === "active";
  const miss = (name) => errors?.includes(name);
  const adr = eff.tolerance === "adr";
  const status = eff.status;
  const hasEnd = needsEnd(drug);
  const showPlaceholder = !active && !rec?.start; // pending row: scheduled time shown greyed

  return (
    <tr
      className={`drug-row is-${state}${errors?.length ? " has-error" : ""}`}
      onMouseDownCapture={(e) => editable && !e.target.closest(".row-actions") && onActivate(drug.id)}
      onFocusCapture={(e) => editable && !e.target.closest(".row-actions") && onActivate(drug.id)}
    >
      <td className="c-drug">
        <b>{drug.name}</b>
        <small>{drug.description}</small>
      </td>
      <td className="c-dose"><b>{drug.dose}</b></td>

      <td className="c-time">
        {saved || state === "locked" ? (
          <span>{eff.start ? fmt12(eff.start) : "--"}</span>
        ) : showPlaceholder ? (
          <input className={`inp inp--time${miss("Start Time") ? " is-missing" : ""}`} disabled value={fmt12(drug.start)} aria-label="Start time (not yet recorded)" readOnly />
        ) : (
          <input type="time" className={`inp inp--time${miss("Start Time") ? " is-missing" : ""}`} value={eff.start} aria-label="Start time" onChange={(e) => onPatch(drug, { start: e.target.value, end: undefined })} />
        )}
        {miss("Start Time") && <em className="miss">Missing</em>}
      </td>

      <td className="c-time">
        {saved || state === "locked" ? (
          <span>{eff.end ? fmt12(eff.end) : "--"}</span>
        ) : showPlaceholder ? (
          <input className={`inp inp--time${miss("End Time") ? " is-missing" : ""}`} disabled value={hasEnd ? fmt12(drug.start) : ""} placeholder="--" aria-label="End time (not yet recorded)" readOnly />
        ) : (
          <input type="time" className={`inp inp--time${miss("End Time") ? " is-missing" : ""}`} value={eff.end} disabled={!hasEnd} aria-label="End time" onChange={(e) => onPatch(drug, { end: e.target.value })} />
        )}
        {miss("End Time") && <em className="miss">Missing</em>}
      </td>

      <td className="c-site">
        {saved || state === "locked" ? (
          <span>{eff.route || "--"}</span>
        ) : (
          <div className={`select${miss("Site/Route") ? " is-missing" : ""}${active ? "" : " is-idle"}`}>
            <select value={eff.route} disabled={!active} aria-label="Site or route" onChange={(e) => onPatch(drug, { route: e.target.value })}>
              <option value="">Select</option>
              {SITE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown width="18" height="18" />
          </div>
        )}
        {miss("Site/Route") && <em className="miss">Missing</em>}
      </td>

      <td className="c-status">
        <div className="status-stack">
          <button
            type="button"
            className={`btn-status btn-status--given${status === "given" ? " is-on" : ""}`}
            disabled={!editable}
            onClick={() => onPatch(drug, { status: "given", start: eff.start || nowHHMM() })}
          >
            <CheckCircle width="14" height="14" /> Given
          </button>
          <button
            type="button"
            className={`btn-status btn-status--not${status === "not-given" ? " is-on" : ""}`}
            disabled={!editable}
            onClick={() => onPatch(drug, { status: "not-given" })}
          >
            <CrossCircle width="14" height="14" /> Not Given
          </button>
          {miss("Status") && <em className="miss">Missing</em>}
        </div>
      </td>

      <td className="c-tol">
        <div className="tol">
          <div className="tol__radios">
            <label><input type="radio" name={`tol-${drug.id}`} disabled={!editable} checked={!adr} onChange={() => onPatch(drug, { tolerance: "stable", grade: null })} /> Stable</label>
            <label><input type="radio" name={`tol-${drug.id}`} disabled={!editable} checked={adr} onChange={() => onPatch(drug, { tolerance: "adr" })} /> ADR</label>
          </div>
          <div className="tol__grades">
            {[1, 2, 3, 4, 5].map((g) => (
              <button key={g} type="button" className={`chip${eff.grade === g ? " is-chosen" : ""}${miss("ADR Grade") ? " is-missing" : ""}`} disabled={!editable || !adr} aria-pressed={eff.grade === g} onClick={() => onPatch(drug, { grade: g })}>
                G{g}
              </button>
            ))}
          </div>
          {saved || state === "locked" ? (
            <p className="tol__text">{eff.description || "--"}</p>
          ) : (
            <input className={`inp inp--desc${miss("ADR Description") ? " is-missing" : ""}`} placeholder="Enter description" value={eff.description} aria-label="Description" onChange={(e) => onPatch(drug, { description: e.target.value })} />
          )}
        </div>
      </td>

      <td className="c-action">
        <div className="row-actions">
          {saved ? (
            <span className="row-actions__saved" title={rec?.nurse ? `Recorded by ${rec.nurse}` : undefined}>Saved</span>
          ) : state === "locked" ? null : (
            <>
              <button type="button" className="link-bold" onClick={() => onSave(drug)}>Save</button>
              <button type="button" className="link-bold" onClick={() => onClear(drug)}>Clear</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------ the day's table */
function DayView({ patient, nurse, cycle, day, records, setRecords, completed, setCompleted, ui, onDischarge }) {
  const drugs = useMemo(() => getDrugs(patient), [patient]);
  const pid = patient.id;
  const [activeId, setActiveId] = useState(null);
  const [auto, setAuto] = useState({});
  const [errors, setErrors] = useState({});
  const mountNow = useMemo(() => nowHHMM(), []);

  const getRec = useCallback(
    (d) => records[keyOf(pid, cycle, day, d.id)] || seedRecord(patient, drugs, cycle, day, d.id),
    [records, pid, cycle, day, patient, drugs],
  );
  const dk = dayKey(pid, cycle, day);
  const isCompleted = !!completed[dk] || isPastDay(patient, cycle, day);
  const authorised = patient.status === "Authorised";
  const viewOnly = isCompleted;
  const locked = !authorised && !viewOnly;
  const unsaved = drugs.filter((d) => !getRec(d)?.saved);
  const activeEff = !viewOnly && !locked ? (unsaved.some((d) => d.id === activeId) ? activeId : unsaved[0]?.id) : null;
  const autoFor = (d) => auto[d.id] ?? (d.id === activeEff ? mountNow : "");

  const activate = (id) => {
    setActiveId(id);
    setAuto((a) => (a[id] ? a : { ...a, [id]: nowHHMM() }));
  };
  const writeRecord = (drug, patch) =>
    setRecords((all) => {
      const k = keyOf(pid, cycle, day, drug.id);
      return { ...all, [k]: { ...(all[k] || {}), ...patch } };
    });
  const clearErr = (id) => setErrors((e) => (e[id] ? { ...e, [id]: undefined } : e));

  const patch = (drug, p) => {
    if (viewOnly || locked) return;
    clearErr(drug.id);
    writeRecord(drug, { ...p, nurse: nurse?.name });
  };

  const effOf = (d, active) => effective(d, getRec(d) || {}, active ? autoFor(d) : "");

  const saveRow = (drug) => {
    if (!nurse) return ui.requireLogin();
    const eff = effOf(drug, drug.id === activeEff);
    const missing = validate(drug, eff);
    if (!getRec(drug)?.status && !touched(getRec(drug))) {
      // nothing entered: flag every required field, as in the design
      setErrors((e) => ({ ...e, [drug.id]: ["Status", "Start Time", ...(needsEnd(drug) ? ["End Time"] : []), "Site/Route"] }));
      return;
    }
    if (missing.length) return setErrors((e) => ({ ...e, [drug.id]: missing }));
    clearErr(drug.id);
    writeRecord(drug, { ...eff, saved: true, nurse: nurse.name, savedAt: new Date().toISOString() });
  };
  const clearRow = (drug) => {
    if (!nurse) return ui.requireLogin();
    clearErr(drug.id);
    setAuto((a) => ({ ...a, [drug.id]: nowHHMM() }));
    setRecords((all) => {
      const next = { ...all };
      delete next[keyOf(pid, cycle, day, drug.id)];
      return next;
    });
  };

  const complete = () => {
    if (!nurse) return ui.requireLogin();
    const issues = [];
    const errs = {};
    const toSave = [];
    unsaved.forEach((d) => {
      const r = getRec(d);
      if (!touched(r)) {
        issues.push({ name: d.name, text: "Administration not recorded" });
        errs[d.id] = ["Status", "Start Time", ...(needsEnd(d) ? ["End Time"] : []), "Site/Route"];
        return;
      }
      const eff = effOf(d, d.id === activeEff);
      const missing = validate(d, eff);
      if (missing.length) {
        issues.push({ name: d.name, text: `Missing : ${missing.join(", ")}` });
        errs[d.id] = missing;
      } else toSave.push([d, eff]);
    });
    if (issues.length) {
      setErrors(errs);
      return ui.openModal("incomplete", { issues });
    }
    setRecords((all) => {
      const next = { ...all };
      toSave.forEach(([d, eff]) => {
        const k = keyOf(pid, cycle, day, d.id);
        next[k] = { ...(next[k] || {}), ...eff, saved: true, nurse: nurse.name, savedAt: new Date().toISOString() };
      });
      return next;
    });
    setCompleted((c) => ({ ...c, [dk]: { by: nurse.name, at: new Date().toISOString() } }));
    setErrors({});
    ui.openModal("completed", { cycle, day, onGenerate: onDischarge });
  };

  // Block every editing control while nobody is logged in; offer the login modal instead.
  const guard = (e) => {
    if (nurse || viewOnly || !e.target.closest(CONTROL)) return;
    if (e.type === "keydown" && ["Tab", "Shift", "Escape"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    ui.requireLogin();
  };

  const showFooter = cycle === patient.currentCycle;
  return (
    <>
      {locked && (
        <div className="notice">
          This treatment has not been authorised by the doctor. Administration entry is unavailable.
        </div>
      )}
      <div className="drug-table-wrap">
        <table className="drug-table">
          <colgroup>
            <col className="w-drug" /><col className="w-dose" /><col className="w-start" /><col className="w-end" />
            <col className="w-site" /><col className="w-status" /><col className="w-tol" /><col className="w-action" />
          </colgroup>
          <thead>
            <tr>
              {["Drug Name", "Dosage", "Start Time", "End Time", "Site/Route", "Drug Status", "Tolerance", "Action"].map((h) => (
                <th key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody onMouseDownCapture={guard} onKeyDownCapture={guard}>
            {drugs.map((d) => {
              const rec = getRec(d);
              const saved = !!rec?.saved;
              const state = saved ? "saved" : locked ? "locked" : d.id === activeEff ? "active" : "pending";
              return (
                <DrugRow
                  key={d.id}
                  drug={d}
                  rec={rec}
                  eff={effOf(d, d.id === activeEff && !saved)}
                  state={state}
                  errors={errors[d.id]}
                  onActivate={activate}
                  onPatch={patch}
                  onSave={saveRow}
                  onClear={clearRow}
                  ui={ui}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {showFooter && (
        <footer className="admin-footer">
          <button type="button" className="btn-outline btn-outline--lg" disabled={!isCompleted} onClick={onDischarge}>
            Generate Discharge Summary
          </button>
          <button type="button" className="btn-primary" disabled={isCompleted || locked} onClick={complete}>
            Complete Administration
          </button>
        </footer>
      )}
    </>
  );
}

/* -------------------------------------------------------------- patient view */
export default function Administration({ patient, nurse, cycle, setCycle, day, setDay, mode, setMode, records, setRecords, completed, setCompleted, vitals, ui }) {
  const latest = useMemo(() => {
    const list = vitals.filter((v) => v.cycle === cycle && v.day === day);
    return list.sort((a, b) => a.time.localeCompare(b.time)).pop() || null;
  }, [vitals, cycle, day]);

  const chooseCycle = (c) => {
    setMode("admin");
    setCycle(c);
    setDay(c === patient.currentCycle ? patient.currentDay : patient.days[0]);
  };
  const chooseDay = (d) => {
    setMode("admin");
    setDay(d);
  };
  const date = fmtDate(dayDate(patient, cycle, day));

  return (
    <main className={`admin${mode === "discharge" ? " admin--discharge" : ""}`}>
      <div className="cycle-strip" role="group" aria-label="Chemotherapy cycles">
        {Array.from({ length: patient.cycles }, (_, i) => {
          const c = i + 1;
          const done = isPastCycle(patient, c);
          const sel = c === cycle;
          return (
            <button
              key={c}
              type="button"
              className={`cycle-btn${sel ? " is-selected" : ""}${done ? " is-done" : ""}`}
              disabled={c > patient.currentCycle}
              aria-pressed={sel}
              onClick={() => chooseCycle(c)}
            >
              {done && <CheckFilled width="16" height="16" />}
              Cycle {c}
            </button>
          );
        })}
      </div>

      <div className="day-strip">
        <div className="day-group" role="group" aria-label="Chemotherapy days">
          {patient.days.map((d) => (
            <button key={d} type="button" className={`day-btn${d === day ? " is-selected" : ""}`} disabled={isFutureDay(patient, cycle, d)} aria-pressed={d === day} onClick={() => chooseDay(d)}>
              D{d}
            </button>
          ))}
        </div>
        <span className="day-date"><Calendar width="16" height="16" /> {date}</span>
        <div className="day-strip__right">
          <button type="button" className="link" onClick={() => ui.openModal("highlights", { cycle, day })}>Chemo Highlights</button>
          <VitalsBar latest={latest} onOpen={() => ui.openDrawer("vitals")} />
        </div>
      </div>

      {mode === "discharge" ? (
        <DischargeSummary patient={patient} cycle={cycle} day={day} records={records} />
      ) : (
        <DayView
          key={`${patient.id}|${cycle}|${day}`}
          patient={patient}
          nurse={nurse}
          cycle={cycle}
          day={day}
          records={records}
          setRecords={setRecords}
          completed={completed}
          setCompleted={setCompleted}
          ui={ui}
          onDischarge={() => setMode("discharge")}
        />
      )}
    </main>
  );
}
