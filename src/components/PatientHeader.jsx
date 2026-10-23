import React from "react";

const initials = (name) => name.split(" ").map((s) => s[0]).slice(0, 2).join("");

export default function PatientHeader({ patient, allergies, comorbidities, onDrawer }) {
  const shownAllergies = allergies.slice(0, 2);
  const extra = Math.max(0, allergies.length - 2);
  return (
    <div className="phdr-scroll">
      <section className="phdr" aria-label="Patient details">
        <div className="phdr__main">
        <div className={`phdr__photo${patient.photo ? " phdr__photo--img" : ""}`}>
          {patient.photo ? <img src={patient.photo} alt="Patient" /> : <span>{initials(patient.name)}</span>}
        </div>
        <div className="phdr__ident">
            <span className="phdr__f"><i>Case No.</i> <b>{patient.id}</b></span>
            <span className="phdr__f phdr__f--name"><i>Patient Name</i> <b>{patient.name}</b></span>
            <span className="phdr__f"><i>Age/Sex</i> <b>{patient.age} y / {patient.sex === "Female" ? "F" : "M"}</b></span>
            <span className="phdr__f"><i>Protocol Name</i> <b>{patient.protocol}</b></span>
            <span className="phdr__f phdr__pair">
              <span><i>DMG</i> <b>{patient.dmg}</b></span>
              <span><i>Dept.</i> <b>{patient.dept}</b></span>
            </span>
        </div>
        </div>
        <div className="phdr__side">
        <div className="phdr__med">
          <div className="phdr__block">
            <h3>Allergies {extra > 0 && <em className="phdr__badge">+{extra}</em>}</h3>
            <p className="phdr__tags">{shownAllergies.length ? shownAllergies.map((a) => <span key={a.id}>{a.allergen}</span>) : <span className="none">None recorded</span>}</p>
            <button type="button" className="link" onClick={() => onDrawer("allergies")}>View all</button>
          </div>
          <div className="phdr__block">
            <h3>Comorbidities</h3>
            <p className="phdr__tags">{comorbidities.length ? comorbidities.slice(0, 2).map((c) => <span key={c.id}>{c.condition}</span>) : <span className="none">None recorded</span>}</p>
            <button type="button" className="link" onClick={() => onDrawer("comorbidities")}>View all &amp; Update</button>
          </div>
        </div>
        <div className="phdr__actions">
          <button type="button" className="btn-outline" onClick={() => onDrawer("clinical")}>Clinical Notes</button>
          <button type="button" className="btn-outline" onClick={() => onDrawer("notes")}>Nurse Notes</button>
        </div>
        </div>
      </section>
    </div>
  );
}
