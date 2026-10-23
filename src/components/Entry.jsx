import React, { useMemo, useState } from "react";
import { EntryHeader } from "./Header";
import { Search } from "./Icons";
import { patients } from "../data/patients";

/* Shared credentials form: used by the login page and the in-page login modal. */
export function CredentialsForm({ onSubmit, buttonClass = "btn-login", autoFocus }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hint, setHint] = useState("");
  const ready = username.trim() && password.trim();
  return (
    <form
      className="cred-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSubmit(username.trim());
      }}
    >
      <label className="field">
        <span>Username</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" autoFocus={autoFocus} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
      </label>
      <button type="button" className="link-underline" onClick={() => setHint("Please contact your hospital administrator to reset your credentials.")}>
        Forgot password?
      </button>
      {hint && <p className="cred-form__hint" role="status">{hint}</p>}
      <button type="submit" className={buttonClass} disabled={!ready}>Log In</button>
    </form>
  );
}

export function LoginScreen({ onLogin }) {
  return (
    <div className="entry entry--login">
      <EntryHeader />
      <main className="login-stage">
        <section className="login-card" aria-labelledby="login-title">
          <h1 id="login-title">Welcome!</h1>
          <p>Please Log In to continue</p>
          <CredentialsForm onSubmit={onLogin} autoFocus />
        </section>
      </main>
    </div>
  );
}

export function PatientSearch({ nurse, recent, onSelect, onLogout, onSettings }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = useMemo(
    () => (q ? patients.filter((p) => `${p.name} ${p.id} ${p.protocol} ${p.diagnosis}`.toLowerCase().includes(q)) : []),
    [q],
  );
  const list = q ? results : recent.map((id) => patients.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="entry entry--search">
      <EntryHeader nurse={nurse} onLogout={onLogout} onSettings={onSettings} />
      <main className="search-stage">
        <header className="search-intro">
          <h1>Patient Search</h1>
          <p>Access patient&rsquo;s administration record by searching with a patient name or case number.</p>
        </header>
        <div className="search-body">
          <label className="search-label" htmlFor="patient-search">Patient name/ case no.</label>
          <div className="search-field">
            <input id="patient-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by patient name/ case no." autoComplete="off" />
            <Search width="20" height="20" />
          </div>
          {!q && <h2 className="search-recent">Recently viewed patients</h2>}
          {list.length ? (
            <ul className={`patient-list${q ? "" : " patient-list--recent"}`}>
              {list.map((p) => (
                <li className="patient-row" key={p.id}>
                  <div className="patient-row__title">
                    <button type="button" onClick={() => onSelect(p.id)}>{p.name}</button>
                    <i aria-hidden="true">|</i>
                    <span>Case No. {p.id}</span>
                  </div>
                  <div className="patient-row__grid">
                    <div><small>Age/ Sex</small><span>{p.age}/ {p.sex}</span></div>
                    <div><small>Diagnosis</small><span>{p.diagnosis}</span></div>
                    <div><small>Protocol Name</small><span>{p.protocol}</span></div>
                    <button type="button" className="btn-outline" onClick={() => onSelect(p.id)}>View</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="search-empty">No patients found. Try another patient name or case number.</p>
          )}
        </div>
      </main>
    </div>
  );
}
