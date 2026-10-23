import React, { useEffect } from "react";
import { Check, CheckBig, Close, Exclaim, Lock, LogOut } from "./Icons";

const titleCase = (t) => t.toLowerCase().replace(/(^|[\s(+/-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
import { CredentialsForm } from "./Entry";
import { getHighlights } from "../data/clinical";

function Shell({ className = "", onClose, children, label, dismissable = true }) {
  useEffect(() => {
    if (!dismissable) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, dismissable]);
  return (
    <div className="overlay" onMouseDown={(e) => dismissable && e.target === e.currentTarget && onClose()}>
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        {dismissable && (
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close"><Close width="24" height="24" /></button>
        )}
        {children}
      </section>
    </div>
  );
}
const Badge = ({ children, tone = "navy" }) => <span className={`modal__badge modal__badge--${tone}`}>{children}</span>;

const Grade = ({ g }) => <span className={`grade grade--${g >= 4 ? "high" : "mid"}`}>G{g}</span>;

export default function Modals({ modal, patient, onClose, onLogin, onLogout, ui }) {
  if (!modal) return null;
  const { kind, payload = {} } = modal;

  if (kind === "login")
    return (
      <Shell className="modal--login" onClose={onClose} label="Log in to continue">
        <Badge><Lock width="32" height="32" /></Badge>
        <h2>Log in to continue</h2>
        <p className="modal__sub">Please enter your credentials to make changes to this patient&rsquo;s records</p>
        <CredentialsForm onSubmit={onLogin} autoFocus />
      </Shell>
    );

  if (kind === "loginRequired")
    return (
      <Shell className="modal--required" onClose={onClose} label="Log in required">
        <Badge><Lock width="32" height="32" /></Badge>
        <h2>Log in Required!</h2>
        <p className="modal__sub">You must log in before making changes to patient records.</p>
        <button type="button" className="btn-primary btn-block" onClick={() => ui.openModal("login")}>Log In</button>
      </Shell>
    );

  if (kind === "logout")
    return (
      <Shell className="modal--confirm" onClose={onClose} label="Log out">
        <Badge><LogOut width="34" height="34" /></Badge>
        <h2>Logging Out!</h2>
        <p className="modal__sub">Are you sure you want to log out?</p>
        <div className="modal__actions">
          <button type="button" className="btn-outline" onClick={onClose}>No</button>
          <button type="button" className="btn-primary" onClick={onLogout}>Yes</button>
        </div>
      </Shell>
    );

  if (kind === "loggedOut")
    return (
      <Shell className="modal--toast" onClose={onClose} label="Logged out">
        <Badge><Check width="30" height="30" /></Badge>
        <h2>Logging Out Successful!</h2>
      </Shell>
    );

  if (kind === "incomplete")
    return (
      <Shell className="modal--incomplete" onClose={onClose} label="Administration incomplete">
        <Badge tone="red"><Exclaim width="34" height="34" /></Badge>
        <h2 className="is-red">Administration Incomplete!</h2>
        <p className="modal__sub">Please enter the required details before completing today&rsquo;s administration.</p>
        <div className="issues-wrap">
          <ul className="issues" tabIndex={0} aria-label="Items to complete">
            {payload.issues.map((it, i) => (
              <li key={i}><b>{titleCase(it.name)}</b><span>{it.text}</span></li>
            ))}
          </ul>
        </div>
      </Shell>
    );

  if (kind === "completed")
    return (
      <Shell className="modal--completed" onClose={onClose} label="Administration completed">
        <Badge><CheckBig width="64" height="64" /></Badge>
        <h2>Administration Completed!</h2>
        <p className="modal__sub">Administration for Cycle {payload.cycle}, Day {payload.day} has been completed and have been recorded.</p>
        <button type="button" className="btn-primary btn-block" onClick={() => { onClose(); payload.onGenerate?.(); }}>
          Generate Discharge Summary
        </button>
      </Shell>
    );

  if (kind === "highlights") {
    const h = getHighlights(patient);
    return (
      <Shell className="modal--highlights" onClose={onClose} label="Chemo Highlights">
        <h2 className="hl-title">Chemo Highlights</h2>
        <p className="hl-sched">Scheduled today <b>Cycle {payload.cycle}</b><i /> <b>Day {payload.day}</b></p>
        <div className="hl-alert">
          <div>
            <h3>Recurring ADRs</h3>
            <div className="hl-head"><span>ADR</span><span>Grade</span></div>
            {h.adrs.length ? h.adrs.map((a) => <div className="hl-row" key={a.name}><span>{a.name}</span><Grade g={a.grade} /></div>) : <p className="hl-none">None recorded</p>}
          </div>
          <div>
            <h3>Significant Toxicities</h3>
            <div className="hl-head hl-head--3"><span>Toxicity</span><span>Grade</span><span>Cycle &amp; Day</span></div>
            {h.toxicities.length ? h.toxicities.map((t) => <div className="hl-row hl-row--3" key={t.name}><span>{t.name}</span><Grade g={t.grade} /><span>{t.when}</span></div>) : <p className="hl-none">None recorded</p>}
          </div>
        </div>
        <div className="hl-cards">
          <div className="hl-card"><h3>Incidents</h3>{h.incidents.length ? <ul>{h.incidents.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="hl-none">None recorded</p>}</div>
          <div className="hl-card hl-card--doctor"><h3>Doctor&rsquo;s Instructions</h3><ul>{h.instructions.map((i) => <li key={i}>{i}</li>)}</ul></div>
        </div>
      </Shell>
    );
  }

  if (kind === "settings")
    return (
      <Shell className="modal--settings" onClose={onClose} label="Settings">
        <h2 className="hl-title">Settings</h2>
        <dl className="settings">
          <dt>Signed in as</dt><dd>{payload.nurse ? `${payload.nurse.name} (${payload.nurse.id})` : "—"}</dd>
          <dt>Role</dt><dd>{payload.nurse?.role || "—"}</dd>
          <dt>Demo data</dt>
          <dd>
            <button type="button" className="btn-outline" onClick={payload.onReset}>Reset demo data</button>
            <small>Clears all saved administration, notes, vitals and allergy edits stored in this browser.</small>
          </dd>
        </dl>
      </Shell>
    );

  if (kind === "confirm")
    return (
      <Shell className="modal--confirm" onClose={onClose} label={payload.title}>
        <Badge tone="red"><Exclaim width="34" height="34" /></Badge>
        <h2>{payload.title}</h2>
        <p className="modal__sub">{payload.text}</p>
        <div className="modal__actions">
          <button type="button" className="btn-outline" onClick={onClose}>No</button>
          <button type="button" className="btn-primary" onClick={() => { payload.onYes(); onClose(); }}>Yes</button>
        </div>
      </Shell>
    );

  return null;
}
