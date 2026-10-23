import { cycleStartDate, dayDate, nextDay } from "../utils/schedule";
import { addDays, fmtDate } from "../utils/time";

// Fictional doctor-authored / historical content. The nurse module treats all of
// this as read-only except where the UI lets a nurse add notes, vitals and
// allergy/comorbidity updates.

const LEAD = "CU/33291";

/* ---------------------------------------------------------------- highlights */
export function getHighlights(p) {
  if (p.id === LEAD) {
    return {
      adrs: [
        { name: "Hypersensitivity Reaction", grade: 4 },
        { name: "Bronchospasm", grade: 3 },
      ],
      toxicities: [
        { name: "Cardiotoxicity", grade: 4, when: "C1 D2" },
        { name: "Neurotoxicity", grade: 3, when: "C2 D2" },
      ],
      incidents: ["Suggestive acute cardiac event", "Loss of consciousness", "Seizure"],
      instructions: ["Monitor neurological symptoms during infusion."],
    };
  }
  return {
    adrs: [],
    toxicities: [],
    incidents: [],
    instructions: ["Follow the authorised protocol and monitor for infusion-related reactions."],
  };
}

/* ------------------------------------------------------------ clinical notes */
export function getClinicalNotes(p) {
  const texts = [
    "Dose reduced by 25% due to poor tolerance in the previous cycle. Monitor closely for mucositis and hematological toxicity.",
    "Proceed with planned doses. Ensure adequate hydration before chemotherapy and monitor closely for nausea, vomiting, and infusion-related reactions..",
  ];
  const notes = [];
  for (let c = 1; c < p.currentCycle; c++) {
    notes.push({ cycle: c, date: fmtDate(cycleStartDate(p, c)), text: texts[c % 2] });
  }
  return notes.reverse();
}

/* -------------------------------------------------------------------- vitals */
// flags are shown pink; copied from the design for the lead patient.
const V = (cycle, day, time, nurse, temp, pulse, spo2, resp, bp, flags = []) => ({
  id: `seed-${cycle}-${day}-${time}`, cycle, day, time, nurse, temp, pulse, spo2, resp, bp, flags, seeded: true,
});
export function getSeedVitals(p) {
  if (p.id === LEAD) {
    const n = "Asha Patil";
    return [
      V(4, 1, "14:30", n, "97", "102", "96", "14", "90/60", ["spo2"]),
      V(4, 2, "14:30", n, "97", "102", "96", "14", "90/60", ["spo2"]),
      V(4, 3, "14:30", n, "97", "102", "96", "14", "90/60", ["bp"]),
      V(4, 3, "20:30", n, "97", "102", "96", "14", "90/60", ["spo2"]),
      V(4, 4, "14:30", n, "97", "102", "96", "14", "90/60", ["bp"]),
      V(4, 4, "20:30", n, "97", "102", "96", "14", "90/60", ["spo2"]),
      V(5, 1, "14:30", n, "97", "102", "96", "14", "90/60", ["spo2"]),
      V(5, 2, "14:30", n, "97", "102", "96", "14", "90/60", ["bp"]),
      V(5, 3, "09:40", n, "97", "102", "96", "14", "90/60", ["pulse"]),
    ];
  }
  if (p.currentCycle > 1 || p.currentDay > 1) {
    const c = p.currentDay > 1 ? p.currentCycle : p.currentCycle - 1;
    const d = p.currentDay > 1 ? p.days[p.days.indexOf(p.currentDay) - 1] : p.days[p.days.length - 1];
    return [V(c, d, "10:00", "Asha Patil", "98.2", "78", "98", "16", "118/76")];
  }
  return [];
}

/* --------------------------------------------------------------- nurse notes */
export function getSeedNotes(p) {
  if (p.id !== LEAD) return [];
  const long =
    "Patient appeared excessively sedated after evening dose of Olanzapine. Responsive to evening dose of Doxorubicin and tolerating oral fluids. Vitals stable; monitoring continued overnight.";
  const mk = (i, cycle, day, time) => ({
    id: `seed-note-${i}`, cycle, day, time, nurse: "Asha Patil",
    date: fmtDate(dayDate(p, cycle, day)), text: long, seeded: true,
  });
  return [mk(1, 5, 2, "14:30"), mk(2, 5, 2, "14:30"), mk(3, 5, 1, "14:30")];
}

/* --------------------------------------------------- allergies / comorbidities */
export function getSeedAllergies(p) {
  const d = (n) => fmtDate(addDays(new Date(`${p.currentDate}T00:00:00`), -n));
  if (p.id === LEAD) {
    const remark = "Patient has a known allergy to Penicillin. Previously developed a generalized skin rash after the first dose.";
    return [
      { id: "al2", type: "Drug Allergy", allergen: "Sulphur", reaction: "Skin redness, itching", severity: "Moderate", remark, by: "Dr. Neil Iyer", on: d(16) },
      { id: "al1", type: "Drug Allergy", allergen: "Penicillin", reaction: "Rash, Itching", severity: "Severe", remark, by: "Dr. Mihika Sharma", on: d(16) },
      { id: "al3", type: "Latex Allergies", allergen: "Latex", reaction: "Skin redness, itching", severity: "Moderate", remark, by: "Dr. Neil Iyer", on: d(30) },
      { id: "al4", type: "Food Allergy", allergen: "Shellfish", reaction: "Hives", severity: "Mild", remark: "", by: "Dr. Nihita Singhal", on: d(45) },
      { id: "al5", type: "Environmental", allergen: "Dust", reaction: "Sneezing", severity: "Mild", remark: "", by: "Dr. Nihita Singhal", on: d(45) },
    ];
  }
  const list = { "CU/50816": ["Penicillin"], "CU/60327": ["Sulfa drugs"] }[p.id] || [];
  return list.map((a, i) => ({
    id: `al${i}`, type: "Drug Allergy", allergen: a, reaction: "", severity: "", remark: "", by: "Dr. Mihika Sharma", on: d(20),
  }));
}
export function getSeedComorbidities(p) {
  const d = fmtDate(addDays(new Date(`${p.currentDate}T00:00:00`), -30));
  const names = {
    "CU/33291": ["Asthma", "Epilepsy"],
    "CU/41782": ["Hypertension"],
    "CU/50816": ["Type 2 diabetes"],
    "CU/29105": ["Hypothyroidism"],
    "CU/60327": ["Hypertension"],
  }[p.id] || [];
  return names.map((n, i) => ({
    id: `co${i}`, condition: n, status: "Under treatment", remark: "", by: "Dr. Mihika Sharma", on: d,
  }));
}

/* ----------------------------------------------------------- discharge summary */
export function getDischarge(p, cycle, day) {
  const nd = nextDay(p, cycle, day);
  const chemo = dayDate(p, nd.cycle, nd.day);
  const base = {
    next: { label: `Cycle ${nd.cycle} Day ${nd.day}`, opd: fmtDate(addDays(chemo, -1)), chemo: fmtDate(chemo) },
    advice: "--",
  };
  if (p.id === LEAD) {
    return {
      ...base,
      symptoms: ["Constipation", "Vomiting", "Indigestion"],
      otherSymptoms: "Watch for unusual bruising, bleeding, or persistent weakness.",
      contact: "90490120000",
      // Placeholder rows copied from the design — NOT prescribing guidance.
      postChemo: [
        { drug: "ONDANSETRON", dose: "300 mg", route: "Oral", frequency: "Twice Daily", duration: "3 Days", instructions: "After Breakfast" },
        { drug: "DEXAMETHASONE", dose: "2.5 mg", route: "Oral", frequency: "Twice Daily", duration: "3 Days", instructions: "After Breakfast" },
        { drug: "PANTOPRAZOLE", dose: "3 mg", route: "Oral", frequency: "Twice Daily", duration: "3 Days", instructions: "After Breakfast" },
        { drug: "PARACETAMOL", dose: "5 mg", route: "Oral", frequency: "Twice Daily", duration: "3 Days", instructions: "After Breakfast" },
      ],
      tests: ["LFT", "RFT", "CBC"],
      otherTests: "Serum Magnesium, Serum Calcium, and Blood Sugar (RBS)",
    };
  }
  return {
    ...base,
    symptoms: ["Nausea", "Fatigue", "Fever"],
    otherSymptoms: "Report any new or worsening symptoms.",
    contact: "90490120000",
    postChemo: [{ drug: "As prescribed by the treating doctor", dose: "--", route: "--", frequency: "--", duration: "--", instructions: "--" }],
    tests: ["CBC"],
    otherTests: "As advised by the treating doctor",
  };
}
