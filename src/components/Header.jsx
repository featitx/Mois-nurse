import React, { useEffect, useMemo, useRef, useState } from "react";
import { BackChevron, ChevronDown, Gear, LogOut, Search, Cog, User } from "./Icons";
import { patients } from "../data/patients";

function useOutsideClose(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const Brand = ({ onBack }) => (
  <div className="topbar__brand">
    {onBack && (
      <button type="button" className="topbar__back" onClick={onBack} aria-label="Back to patient search">
        <BackChevron />
      </button>
    )}
    <img className="topbar__logo" src="/assets/tmh-logo.png" alt="" width="28" height="28" />
    <span className="topbar__title">TATA Memorial Hospital</span>
  </div>
);

/* Menu used by the account button (patient view) and the gear (entry screens). */
function Menu({ nurse, onLogin, onLogout, onSettings, onClose }) {
  return (
    <div className={`menu${nurse ? "" : " menu--plain"}`} role="menu">
      {nurse ? (
        <>
          <div className="menu__who">
            <span className="menu__avatar"><User width="24" height="24" /></span>
            <div>
              <strong>{nurse.name}</strong>
              <small>{nurse.role}</small>
            </div>
          </div>
          <hr />
          <button type="button" role="menuitem" onClick={() => { onClose(); onSettings(); }}>
            <Cog width="16" height="16" /> Settings
          </button>
          <button type="button" role="menuitem" onClick={() => { onClose(); onLogout(); }}>
            <LogOut width="16" height="16" /> Log Out
          </button>
        </>
      ) : (
        <button type="button" role="menuitem" onClick={() => { onClose(); onLogin(); }}>
          Log In
        </button>
      )}
    </div>
  );
}

/* Dark top bar for the login and search screens: logo + title, gear on the right. */
export function EntryHeader({ nurse, onLogout, onSettings }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <header className="topbar topbar--entry">
      <Brand />
      {nurse && (
        <div className="topbar__menu-wrap" ref={ref}>
          <button type="button" className="topbar__gear" aria-label="Settings and log out" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Gear width="26" height="26" />
          </button>
          {open && <Menu nurse={nurse} onLogout={onLogout} onSettings={onSettings} onClose={() => setOpen(false)} />}
        </div>
      )}
      {!nurse && (
        <span className="topbar__gear" aria-hidden="true"><Gear width="26" height="26" /></span>
      )}
    </header>
  );
}

/* Patient-view top bar: back, logo, patient search, account menu. */
export function AppHeader({ nurse, onBack, onLogin, onLogout, onSettings, onSelectPatient, requireLogin }) {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const menuRef = useOutsideClose(menu, () => setMenu(false));
  const searchRef = useOutsideClose(focus, () => setFocus(false));
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => `${p.name} ${p.id}`.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);
  const pick = (p) => {
    setQuery("");
    setFocus(false);
    onSelectPatient(p.id);
  };
  return (
    <header className="topbar">
      <Brand onBack={onBack} />
      <div className="topbar__right">
        <div className="topbar__search-wrap" ref={searchRef}>
          <label className={`topbar__search ${nurse ? "" : "is-disabled"}`}>
            <Search width="16" height="16" />
            <input
              type="text"
              value={query}
              readOnly={!nurse}
              placeholder="Search for a patient name/ case no."
              aria-label="Search for a patient name or case number"
              onFocus={(e) => {
                if (!nurse) { e.target.blur(); requireLogin(); return; }
                setFocus(true);
              }}
              onChange={(e) => { setQuery(e.target.value); setFocus(true); }}
              onKeyDown={(e) => e.key === "Enter" && matches[0] && pick(matches[0])}
            />
          </label>
          {focus && query.trim() && (
            <ul className="topbar__results">
              {matches.length ? matches.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => pick(p)}>
                    <strong>{p.name}</strong> <span>Case No. {p.id}</span>
                  </button>
                </li>
              )) : <li className="topbar__none">No patients found</li>}
            </ul>
          )}
        </div>
        <div className="topbar__menu-wrap" ref={menuRef}>
          <button type="button" className="topbar__account" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((o) => !o)}>
            <span className="topbar__avatar"><User width="30" height="30" /></span>
            <span className="topbar__name">{nurse ? nurse.name : "Log In"}</span>
            <ChevronDown className="topbar__chev" width="28" height="28" />
          </button>
          {menu && <Menu nurse={nurse} onLogin={onLogin} onLogout={onLogout} onSettings={onSettings} onClose={() => setMenu(false)} />}
        </div>
      </div>
    </header>
  );
}
