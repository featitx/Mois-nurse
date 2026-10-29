import React, { useEffect, useMemo, useRef, useState } from "react";
import { Close, Mic, Pencil, Plus, Trash } from "./Icons";
import { dayDate, isFutureDay } from "../utils/schedule";
import { fmt12Compact, fmtDate, nowHHMM } from "../utils/time";
import { VITAL_FIELDS, flagVitals, parseBp } from "../utils/vitals";
import { getClinicalNotes } from "../data/clinical";

function Shell({ title, onClose, wide, children }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={`drawer${wide ? " drawer--wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="drawer__head">
          <h2>{title}</h2>
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Close"><Close width="26" height="26" /></button>
        </header>
        <div className="drawer__body">{children}</div>
      </aside>
    </div>
  );
}

const sortKey = (n) => n.cycle * 1e7 + n.day * 1e5 + (n.time ? Number(n.time.replace(":", "")) : 0);

/* --------------------------------------------------------------- nurse notes */
function ExpandText({ text, limit = 109 }) {
  const [open, setOpen] = useState(false);
  const long = text.length > limit;
  return (
    <p className="note__text">
      {open || !long ? text : `${text.slice(0, limit).trimEnd()}... `}
      {long && (
        <button type="button" className="link" onClick={() => setOpen((o) => !o)}>{open ? " show less" : "show more"}</button>
      )}
    </p>
  );
}

function NurseNotes({ patient, nurse, cycle, day, notes, onAdd, ui }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [listening, setListening] = useState(false);
  const recog = useRef(null);
  const date = fmtDate(dayDate(patient, cycle, day));

  const groups = useMemo(() => {
    const sorted = [...notes].sort((a, b) => sortKey(b) - sortKey(a));
    const out = [];
    sorted.forEach((n) => {
      const g = out.find((x) => x.cycle === n.cycle && x.day === n.day);
      g ? g.items.push(n) : out.push({ cycle: n.cycle, day: n.day, date: n.date, items: [n] });
    });
    return out;
  }, [notes]);

  const addTag = (label) => {
    if (!nurse) return ui.requireLogin();
    setErr("");
    setText((t) => `${t}${t && !t.endsWith("\n") ? "\n" : ""}${label}: `);
  };
  const voice = () => {
    if (!nurse) return ui.requireLogin();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setErr("Voice to text is not supported in this browser.");
    if (listening) return recog.current?.stop();
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (e) => setText((t) => `${t}${t ? " " : ""}${e.results[0][0].transcript}`);
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); setErr("Could not capture audio. Check microphone permission."); };
    recog.current = r;
    setListening(true);
    setErr("");
    r.start();
  };
  const save = () => {
    if (!nurse) return ui.requireLogin();
    if (!text.trim()) return setErr("Enter a note before saving.");
    onAdd({ id: `n-${Date.now()}`, cycle, day, date, time: nowHHMM(), nurse: nurse.name, text: text.trim() });
    setText("");
    setErr("");
  };

  return (
    <>
      <section className="notes-new">
        <h3 className="notes-new__title">
          Today&rsquo;s Notes <i /> <span>{date}</span>
          <em className="pill">Cycle {cycle} <i /> Day {day}</em>
        </h3>
        <div className={`composer${err ? " has-error" : ""}`}>
          <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} placeholder="Enter notes for today..." aria-label="Notes for today" rows={4} />
          <button type="button" className={`composer__voice${listening ? " is-live" : ""}`} onClick={voice}><Mic width="14" height="14" /> {listening ? "Listening… tap to stop" : "Voice to text"}</button>
          <div className="composer__chips">
            {["Toxicity", "Incident", "Patient Response"].map((c) => (
              <button type="button" key={c} className="chip-add" onClick={() => addTag(c)}><Plus width="12" height="12" /> {c}</button>
            ))}
          </div>
        </div>
        {err && <p className="form-err" role="alert">{err}</p>}
        <div className="form-actions">
          <button type="button" className="btn-ghost" disabled={!text} onClick={() => { setText(""); setErr(""); }}>Discard</button>
          <button type="button" className="btn-primary" onClick={save}>Save</button>
        </div>
      </section>

      <section className="notes-prev">
        <h3>Previous Notes</h3>
        {groups.length === 0 && <p className="empty">No notes recorded yet.</p>}
        {groups.map((g) => (
          <div className="notes-group" key={`${g.cycle}-${g.day}`}>
            <div className="notes-group__head">
              <b>{g.date}</b>
              <em className="pill">Cycle {g.cycle} <i /> Day {g.day}</em>
            </div>
            {g.items.map((n) => (
              <article className="note" key={n.id}>
                <div className="note__meta note__meta--d">{fmt12Compact(n.time)} <i /> Nurse {n.nurse}</div>
                <div className="note__meta note__meta--m">
                  <span><b>{n.date}</b> <i /> {fmt12Compact(n.time)}</span>
                  <em className="pill pill--sm">C{n.cycle} <i /> D{n.day}</em>
                  <small>Nurse {n.nurse}</small>
                </div>
                <ExpandText text={n.text} />
              </article>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}

/* ------------------------------------------------------------- clinical notes */
function ClinicalNotes({ patient }) {
  const list = getClinicalNotes(patient);
  return (
    <div className="clin">
      {list.length === 0 && <p className="empty">No clinical notes for earlier cycles.</p>}
      {list.map((n) => (
        <article className="clin__card" key={n.cycle}>
          <h4>Cycle {n.cycle} <i /> <span>{n.date}</span></h4>
          <p>{n.text}</p>
        </article>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------- vitals */
const EMPTY = { temp: "", pulse: "", spo2: "", resp: "", bp: "" };

export function ReadingRow({ v }) {
  return (
    <div className="reading">
      {VITAL_FIELDS.map((f, i) => (
        <React.Fragment key={f.key}>
          {i > 0 && <i aria-hidden="true" />}
          <span className={v.flags?.includes(f.key) ? "is-flag" : undefined}>{f.fmt(v[f.key])}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function Vitals({ patient, nurse, cycle, day, vitals, onAdd, ui, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const canRecord = cycle === patient.currentCycle && !isFutureDay(patient, cycle, day);
  const filled = Object.values(form).some((v) => v.trim() !== "");
  const bpBad = form.bp.trim() !== "" && !parseBp(form.bp);
  const numBad = (k) => form[k].trim() !== "" && !/^\d+(\.\d)?$/.test(form[k].trim());
  const invalid = bpBad || ["temp", "pulse", "spo2", "resp"].some(numBad);
  const when = fmt12Compact(nowHHMM());
  const date = fmtDate(dayDate(patient, cycle, day));

  const groups = useMemo(() => {
    const list = vitals
      .filter((v) => v.cycle < cycle || (v.cycle === cycle && v.day <= day))
      .sort((a, b) => sortKey(b) - sortKey(a));
    const out = [];
    list.forEach((v) => {
      let c = out.find((x) => x.cycle === v.cycle);
      if (!c) out.push((c = { cycle: v.cycle, days: [] }));
      let d = c.days.find((x) => x.day === v.day);
      if (!d) c.days.push((d = { day: v.day, items: [] }));
      d.items.push(v);
    });
    return out;
  }, [vitals, cycle, day]);

  const save = () => {
    if (!nurse) return ui.requireLogin();
    if (!filled || invalid) return;
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    onAdd({ id: `v-${Date.now()}`, cycle, day, time: nowHHMM(), nurse: nurse.name, ...clean, flags: flagVitals(clean) });
    setForm(EMPTY);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field = (k, unit, cls = "") => (
    <div className={`vfield ${cls}${k === "bp" ? " vfield--bp" : ""}`}>
      <label htmlFor={`v-${k}`}>{VITAL_FIELDS.find((f) => f.key === k).label}</label>
      <div className={`vinput${(k === "bp" ? bpBad : numBad(k)) ? " is-bad" : ""}`}>
        <input id={`v-${k}`} inputMode={k === "bp" ? "text" : "decimal"} value={form[k]} onChange={set(k)} placeholder={k === "bp" ? "/" : ""} autoComplete="off" />
        <span>{unit}</span>
      </div>
    </div>
  );

  return (
    <>
      {canRecord && (
        <section className="vit-new">
          <p className="vit-new__when"><b>Cycle {cycle}</b> <i /> <b>Day {day}</b> <i /> <span>{date}</span> <i /> <span>{when}</span></p>
          <div className="vit-form">
            {field("temp", "ºF")}
            {field("pulse", "p/min")}
            {field("spo2", "%")}
            {field("resp", "r/min")}
            {field("bp", "mmHg")}
          </div>
          {(bpBad || invalid) && <p className="form-err" role="alert">{bpBad ? "Enter blood pressure as systolic/diastolic, e.g. 120/80." : "Enter numbers only."}</p>}
          <div className="form-actions">
            <button type="button" className="btn-ghost btn-ghost--d" disabled={!filled} onClick={() => setForm(EMPTY)}>Discard</button>
            <button type="button" className="btn-ghost btn-ghost--m" onClick={() => (filled ? setForm(EMPTY) : onClose())}>Cancel</button>
            <button type="button" className="btn-primary" disabled={!filled || invalid} onClick={save}>Save</button>
          </div>
        </section>
      )}
      <section className="vit-prev">
        {canRecord && <h3>Previous Vitals</h3>}
        {groups.length === 0 && <p className="empty">No vitals recorded yet.</p>}
        {groups.map((c) => (
          <div key={c.cycle} className="vit-cycle">
            <h4>Cycle {c.cycle}</h4>
            {c.days.map((d) => (
              <article className="vit-day" key={d.day}>
                <h5>Day {d.day} <i /> <span>{fmtDate(dayDate(patient, c.cycle, d.day))}</span></h5>
                {d.items.map((v) => (
                  <div className="vit-entry" key={v.id}>
                    <p>{fmt12Compact(v.time)} <i /> Nurse {v.nurse}</p>
                    <ReadingRow v={v} />
                  </div>
                ))}
              </article>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}

/* ------------------------------------------- allergies & comorbidities (table) */
const ALLERGY_TYPES = ["Drug Allergy", "Food Allergy", "Latex Allergies", "Environmental", "Other"];
const SEVERITY = ["Mild", "Moderate", "Severe"];

function Remark({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return <>--</>;
  const long = text.length > 87;
  return (
    <>
      {open || !long ? text : `${text.slice(0, 87).trimEnd()}... `}
      {long && <button type="button" className="link" onClick={() => setOpen((o) => !o)}>{open ? " show less" : "show more"}</button>}
    </>
  );
}

function ConditionTable({ kind, rows, setRows, nurse, ui }) {
  const isAllergy = kind === "allergies";
  const blank = isAllergy
    ? { type: ALLERGY_TYPES[0], allergen: "", reaction: "", severity: "Mild", remark: "" }
    : { condition: "", severity: "Mild", remark: "" }; // Changed for comorbidities to have severity
  
  const [editing, setEditing] = useState(null); 
  const [draft, setDraft] = useState(blank);
  const [err, setErr] = useState("");
  const required = isAllergy ? "allergen" : "condition";

  const guard = (fn) => () => (nurse ? fn() : ui.requireLogin());
  const open = (row) => { setEditing(row ? row.id : "new"); setDraft(row ? { ...row } : blank); setErr(""); };
  const stamp = { by: nurse ? `Nurse ${nurse.name}` : "", on: fmtDate(new Date()) };
  
  const submit = () => {
    if (!draft[required].trim()) return setErr(`${isAllergy ? "Allergen" : "Condition"} is required.`);
    if (editing === "new") setRows((r) => [...r, { ...draft, id: `x-${Date.now()}`, ...stamp }]);
    else setRows((r) => r.map((x) => (x.id === editing ? { ...x, ...draft, ...stamp } : x)));
    setEditing(null);
  };
  
  const del = (row) =>
    ui.openModal("confirm", {
      title: "Delete entry?",
      text: `Remove ${isAllergy ? row.allergen : row.condition} from this patient's record?`,
      onYes: () => setRows((r) => r.filter((x) => x.id !== row.id)),
    });
    
  const d = (k) => ({ value: draft[k] || "", onChange: (e) => { setDraft((x) => ({ ...x, [k]: e.target.value })); setErr(""); } });

  return (
    <div className="cond">
      {/* --- FORM SECTION (ONLY FOR COMORBIDITIES) --- */}
      {!isAllergy && (
        <div className="cond__top">
          {editing ? (
            <div className="cond-form-wrapper">
              <h3 className="cond-form-heading">
                {editing === "new" ? "Add New Comorbidity" : "Edit Comorbidity"}
              </h3>
              <form className="cond-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div className="cond-form-grid">
                  <label className="cond-field">
                    <span>Add Comorbidity</span>
                    <select required {...d("condition")}>
                      <option value="">Select comorbidity</option>
                      <option value="Asthma">Asthma</option>
                      <option value="Epilepsy">Epilepsy</option>
                      <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                    </select>
                  </label>
                  <div className="cond-field">
                    <span>Severity</span>
                    <div className="severity-chips">
                      {SEVERITY.map((s) => (
                        <button key={s} type="button" className={`btn-sev ${draft.severity === s ? "is-active" : ""}`} onClick={() => setDraft((x) => ({ ...x, severity: s }))}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <label className="cond-field">
                  <span>Remark (Optional)</span>
                  <input {...d("remark")} placeholder="Enter additional details" />
                </label>
                <div className="cond-form-actions">
                  <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Discard</button>
                  <button type="submit" className="btn-primary" disabled={!draft[required]?.trim()}>Save</button>
                </div>
                {err && <p className="form-err" role="alert">{err}</p>}
              </form>
            </div>
          ) : (
            <div className="cond-add-wrapper">
              <button type="button" className="btn-outline cond__add" onClick={guard(() => open(null))}>
                <Plus width="12" height="12" /> Add Comorbidity
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TABLE SECTION --- */}
      <div className="cond__scroll">
        <h3 className="cond__title">Previously Recorded {isAllergy ? "Allergies" : "Comorbidities"}</h3>
        <table className={`cond-table ${isAllergy ? "cond-table--allergy" : "cond-table--comorb"}`}>
          <thead>
            <tr>
              {isAllergy ? (
                <><th>Allergy Type</th><th>Allergen</th><th>Reaction</th><th>Severity</th></>
              ) : (
                <><th>Comorbidity</th><th>Severity</th></>
              )}
              <th className="w-remark">Remark</th>
              <th>Last Updated</th>
              
              {/* Only show Edit/Delete headers for Comorbidities */}
              {!isAllergy && (
                <><th className="w-icon">Edit</th><th className="w-icon">Delete</th></>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={isAllergy ? 6 : 6} className="cond__empty">None recorded</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                {isAllergy ? (
                  <><td>{r.type || "--"}</td><td>{r.allergen || "--"}</td><td>{r.reaction || "--"}</td><td>{r.severity || "--"}</td></>
                ) : (
                  <><td>{r.condition || "--"}</td><td>{r.severity || "--"}</td></>
                )}
                <td><Remark text={r.remark} /></td>
                <td className="cond__upd">{r.by}<small>{r.on}</small></td>
                
                {/* Only show Edit/Delete cells for Comorbidities */}
                {!isAllergy && (
                  <>
                    <td className="cond__icon"><button type="button" onClick={guard(() => open(r))}><Pencil width="16" height="16" /></button></td>
                    <td className="cond__icon cond__icon--del"><button type="button" onClick={guard(() => del(r))}><Trash width="18" height="18" /></button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- switch */
export default function Drawers({ kind, onClose, patient, nurse, cycle, day, notes, addNote, vitals, addVitals, allergies, setAllergies, comorbidities, setComorbidities, ui }) {
  if (!kind) return null;
const title = { 
  notes: "Nurse’s Notes", 
  clinical: "Clinical notes", 
  vitals: "Vitals", 
  allergies: "View Allergies",             // Match Screenshot 1
  comorbidities: "View & Update Comorbidities" // Match Screenshot 2
}[kind];  return (
    <Shell title={title} onClose={onClose} wide={kind === "allergies" || kind === "comorbidities"}>
      {kind === "notes" && <NurseNotes patient={patient} nurse={nurse} cycle={cycle} day={day} notes={notes} onAdd={addNote} ui={ui} />}
      {kind === "clinical" && <ClinicalNotes patient={patient} />}
      {kind === "vitals" && <Vitals patient={patient} nurse={nurse} cycle={cycle} day={day} vitals={vitals} onAdd={addVitals} ui={ui} onClose={onClose} />}
      {kind === "allergies" && <ConditionTable kind="allergies" rows={allergies} setRows={setAllergies} nurse={nurse} ui={ui} />}
      {kind === "comorbidities" && <ConditionTable kind="comorbidities" rows={comorbidities} setRows={setComorbidities} nurse={nurse} ui={ui} />}
    </Shell>
  );
}
