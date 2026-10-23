import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/Header";
import { LoginScreen, PatientSearch } from "./components/Entry";
import PatientHeader from "./components/PatientHeader";
import Administration from "./components/Administration";
import Drawers from "./components/Drawers";
import Modals from "./components/Modals";
import { patients } from "./data/patients";
import { getSeedAllergies, getSeedComorbidities, getSeedNotes, getSeedVitals } from "./data/clinical";
import { resolveNurse } from "./data/nurses";

const PREFIX = "mois-nurse-v3-";
function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable — the app keeps working in memory */
    }
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [nurse, setNurse] = useState(null); // session is intentionally not persisted
  const [view, setView] = useState("login"); // login | search | patient
  const [patientId, setPatientId] = useState(null);
  const [cycle, setCycle] = useState(1);
  const [day, setDay] = useState(1);
  const [mode, setMode] = useState("admin"); // admin | discharge
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState("");

  const [recent, setRecent] = usePersisted("recent", ["CU/33291", "CU/41782", "CU/50816"]);
  const [records, setRecords] = usePersisted("records", {});
  const [completed, setCompleted] = usePersisted("completed", {});
  const [userNotes, setUserNotes] = usePersisted("notes", {});
  const [userVitals, setUserVitals] = usePersisted("vitals", {});
  const [allergyEdits, setAllergyEdits] = usePersisted("allergies", {});
  const [comorbEdits, setComorbEdits] = usePersisted("comorbidities", {});

  const patient = useMemo(() => patients.find((p) => p.id === patientId) || null, [patientId]);

  /* ------------------------------------------------------------ overlays */
  const toastTimer = useRef(null);
  const openModal = useCallback((kind, payload) => setModal({ kind, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const ui = useMemo(
    () => ({
      openModal,
      openDrawer: setDrawer,
      requireLogin: () => openModal("loginRequired"),
    }),
    [openModal],
  );
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ------------------------------------------------------------- session */
  const login = (username) => {
    setNurse(resolveNurse(username));
    if (view === "login") setView("search");
    setModal(null);
  };
  const logout = () => {
    setNurse(null);
    setDrawer("");
    if (view === "search") setView("login");
    openModal("loggedOut");
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setModal((m) => (m?.kind === "loggedOut" ? null : m)), 1600);
  };
  const resetDemo = () => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("mois-nurse")).forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  /* ------------------------------------------------------------ patients */
  const selectPatient = (id) => {
    const p = patients.find((x) => x.id === id);
    if (!p) return;
    setPatientId(id);
    setCycle(p.currentCycle);
    setDay(p.currentDay);
    setMode("admin");
    setDrawer("");
    setModal(null);
    setView("patient");
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 6));
  };
  const back = () => {
    setDrawer("");
    setView(nurse ? "search" : "login");
  };

  /* ----------------------------------------------- per-patient collections */
  const pid = patientId;
  const notes = useMemo(() => (patient ? [...getSeedNotes(patient), ...(userNotes[pid] || [])] : []), [patient, pid, userNotes]);
  const vitals = useMemo(() => (patient ? [...getSeedVitals(patient), ...(userVitals[pid] || [])] : []), [patient, pid, userVitals]);
  const allergies = patient ? allergyEdits[pid] ?? getSeedAllergies(patient) : [];
  const comorbidities = patient ? comorbEdits[pid] ?? getSeedComorbidities(patient) : [];
  const setAllergies = (fn) => setAllergyEdits((m) => ({ ...m, [pid]: fn(m[pid] ?? getSeedAllergies(patient)) }));
  const setComorbidities = (fn) => setComorbEdits((m) => ({ ...m, [pid]: fn(m[pid] ?? getSeedComorbidities(patient)) }));

  const modals = (
    <Modals
      modal={modal}
      patient={patient}
      onClose={closeModal}
      onLogin={login}
      onLogout={() => { setModal(null); logout(); }}
      ui={ui}
    />
  );
  const openLogout = () => openModal("logout");
  const openSettings = () => openModal("settings", { nurse, onReset: resetDemo });

  if (view === "login") {
    return (
      <>
        <LoginScreen onLogin={login} />
        {modals}
      </>
    );
  }
  if (view === "search" || !patient) {
    return (
      <>
        <PatientSearch nurse={nurse} recent={recent} onSelect={selectPatient} onLogout={openLogout} onSettings={openSettings} />
        {modals}
      </>
    );
  }
  return (
    <div className="app">
      <AppHeader
        nurse={nurse}
        onBack={back}
        onLogin={() => openModal("login")}
        onLogout={openLogout}
        onSettings={openSettings}
        onSelectPatient={selectPatient}
        requireLogin={ui.requireLogin}
      />
      <PatientHeader patient={patient} allergies={allergies} comorbidities={comorbidities} onDrawer={setDrawer} />
      <Administration
        patient={patient}
        nurse={nurse}
        cycle={cycle}
        setCycle={setCycle}
        day={day}
        setDay={setDay}
        mode={mode}
        setMode={setMode}
        records={records}
        setRecords={setRecords}
        completed={completed}
        setCompleted={setCompleted}
        vitals={vitals}
        ui={ui}
      />
      <Drawers
        kind={drawer}
        onClose={() => setDrawer("")}
        patient={patient}
        nurse={nurse}
        cycle={cycle}
        day={day}
        notes={notes}
        addNote={(n) => setUserNotes((m) => ({ ...m, [pid]: [...(m[pid] || []), n] }))}
        vitals={vitals}
        addVitals={(v) => setUserVitals((m) => ({ ...m, [pid]: [...(m[pid] || []), v] }))}
        allergies={allergies}
        setAllergies={setAllergies}
        comorbidities={comorbidities}
        setComorbidities={setComorbidities}
        ui={ui}
      />
      {modals}
    </div>
  );
}
