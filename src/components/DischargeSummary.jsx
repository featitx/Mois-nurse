import React from "react";
import { getDrugs, seedRecord } from "../data/patients";
import { getDischarge } from "../data/clinical";
import { keyOf } from "../utils/schedule";

const nn = (n) => String(n).padStart(2, "0");

export default function DischargeSummary({ patient, cycle, day, records }) {
  const drugs = getDrugs(patient);
  const info = getDischarge(patient, cycle, day);
  const recOf = (d) => records[keyOf(patient.id, cycle, day, d.id)] || seedRecord(patient, drugs, cycle, day, d.id) || {};

  return (
    <section className="ds" aria-label={`Cycle ${cycle} Day ${day} discharge summary`}>
      <h2 className="ds__title">Cycle {cycle}&nbsp; Day {day} Details</h2>

      <div className="ds-card">
        <h3>Chemo Drug Details</h3>
        <div className="ds-table-wrap">
          <table className="ds-table ds-table--chemo">
            <thead>
              <tr>
                <th className="w-sr">Sr No.</th><th>Drug</th><th>Dose Given</th><th>Modifications</th><th>Reason For Modification</th><th>Significant Toxicities / ADR</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((d, i) => {
                const r = recOf(d);
                const given = r.status === "given";
                const adr = r.tolerance === "adr" && r.grade;
                return (
                  <tr key={d.id}>
                    <td>{nn(i + 1)}</td>
                    <td><b>{d.name}</b></td>
                    <td>{given ? d.dose : r.status === "not-given" ? "Not given" : "--"}</td>
                    <td>{d.modification || "--"}</td>
                    <td className={d.modReason ? "is-alert" : undefined}>{d.modReason || "--"}</td>
                    <td className={adr ? "is-alert" : undefined}>
                      {adr ? <><span>ADR G{r.grade}</span>{r.description ? <small title={r.description}>{r.description}</small> : null}</> : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ds-card">
        <h3 className="monitor-symt">Symptoms to Monitor</h3>
        <p className="ds-list">{info.symptoms.map((s, i) => <span key={s}>{i + 1}. {s}</span>)}</p>
        <small className="ds-cap">Other Symptoms</small>
        <p className="ds-text">{info.otherSymptoms}</p>
        <p className="ds-strong">If you experience any new, severe, or unusual symptoms, even if they are not listed above, please visit the hospital or contact : {info.contact}</p>
      </div>

      <div className="ds-card">
        <h3>Post Chemo Medications</h3>
        <div className="ds-table-wrap">
          <table className="ds-table ds-table--post">
            <thead>
              <tr><th className="w-sr">Sr No.</th><th>Drug</th><th>Dose</th><th>Route</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
            </thead>
            <tbody>
              {info.postChemo.map((m, i) => (
                <tr key={m.drug}>
                  <td>{nn(i + 1)}</td><td><b>{m.drug}</b></td><td>{m.dose}</td><td>{m.route}</td><td>{m.frequency}</td><td>{m.duration}</td><td>{m.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ds-card">
        <h3>Tests Recommended</h3>
        <p className="ds-list">{info.tests.map((s, i) => <span key={s}>{i + 1}. {s}</span>)}</p>
        <small className="ds-cap">Test Recommended</small>
        <p className="ds-text">{info.otherTests}</p>
      </div>

      <div className="ds-card">
        <h3>Next Chemo Day Details <span className="ds-pill">{info.next.label}</span></h3>
        <div className="ds-next">
          <div><small className="ds-cap">OPD Visit</small><p className="ds-text">{info.next.opd}</p></div>
          <div><small className="ds-cap">Chemo Administration</small><p className="ds-text">{info.next.chemo}</p></div>
        </div>
      </div>

      <div className="ds-card">
        <h3>Advice on Discharge</h3>
        <p className="ds-text">{info.advice}</p>
      </div>

      <footer className="admin-footer admin-footer--single">
        <button type="button" className="btn-primary btn-primary--lg" onClick={() => window.print()}>Generate Discharge Summary</button>
      </footer>
    </section>
  );
}
