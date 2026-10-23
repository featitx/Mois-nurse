// All patients and regimens are FICTIONAL demonstration fixtures.
// Doses, durations and dates are placeholders (several copied from the design
// mock-ups) — never use them as medication orders.

export const patients = [
  {
    id: "CU/33291",
    name: "Ritakumari Balsekar",
    age: 55,
    sex: "Female",
    diagnosis: "Thigh/ Toe, NOS - Rhabdomyosarcoma, NOS",
    protocol: "BST - IFOS ADRIA (ADJUVANT)",
    dmg: "BJT",
    dept: "GNC",
    photo: "/patient-photo-cu33291.png",
    cycles: 12,
    days: [1, 2, 3, 4, 5],
    currentCycle: 5,
    currentDay: 3,
    currentDate: "2026-05-28",
    savedToday: 2, // rows already saved earlier on the current day
    regimen: "sarcoma",
    status: "Authorised",
  },
  {
    id: "CU/41782",
    name: "Meera Shah",
    age: 48,
    sex: "Female",
    diagnosis: "Breast carcinoma",
    protocol: "AC-T (ADJUVANT)",
    dmg: "Breast",
    dept: "Medical Oncology",
    cycles: 8,
    days: [1],
    currentCycle: 3,
    currentDay: 1,
    currentDate: "2026-06-09",
    savedToday: 0,
    regimen: "breast",
    status: "Authorised",
  },
  {
    id: "CU/50816",
    name: "Arun Deshmukh",
    age: 62,
    sex: "Male",
    diagnosis: "Colorectal adenocarcinoma",
    protocol: "mFOLFOX6",
    dmg: "GI",
    dept: "Medical Oncology",
    cycles: 12,
    days: [1, 2],
    currentCycle: 4,
    currentDay: 1,
    currentDate: "2026-06-10",
    savedToday: 0,
    regimen: "colon",
    status: "Authorised",
  },
  {
    id: "CU/29105",
    name: "Farida Khan",
    age: 57,
    sex: "Female",
    diagnosis: "HER2-positive breast carcinoma",
    protocol: "PACL + TRAS",
    dmg: "Breast",
    dept: "Medical Oncology",
    cycles: 12,
    days: [1, 8, 15],
    currentCycle: 6,
    currentDay: 8,
    currentDate: "2026-06-11",
    savedToday: 1,
    regimen: "her2",
    status: "Authorised",
  },
  {
    id: "CU/60327",
    name: "Suresh Iyer",
    age: 66,
    sex: "Male",
    diagnosis: "Diffuse large B-cell lymphoma",
    protocol: "R-CHOP",
    dmg: "Haematology",
    dept: "Medical Oncology",
    cycles: 6,
    days: [1],
    currentCycle: 2,
    currentDay: 1,
    currentDate: "2026-06-12",
    savedToday: 0,
    regimen: "lymphoma",
    status: "Awaiting authorisation",
  },
  {
    id: "CU/38450",
    name: "Nisha Patel",
    age: 39,
    sex: "Female",
    diagnosis: "Ovarian carcinoma",
    protocol: "CARBOPLATIN + PACLITAXEL",
    dmg: "Gynaecology",
    dept: "Medical Oncology",
    cycles: 6,
    days: [1],
    currentCycle: 2,
    currentDay: 1,
    currentDate: "2026-06-12",
    savedToday: 0,
    regimen: "ovarian",
    status: "Authorised",
  },
];

// route: "Oral" | "Intravenous" | "Subcutaneous" — drives the default site and
// whether an End Time is expected (oral / single-shot drugs have none).
const drug = (id, name, description, dose, start, duration, route = "Intravenous", extra = {}) => ({
  id, name, description, dose, start, duration, route, ...extra,
});

export const regimenDrugs = {
  // Dosage cells and descriptions are verbatim from the approved design mock-ups.
  sarcoma: [
    drug("olanzapine", "OLANAZIPINE", "2.50 mg = 2.50 mg, Per Oral Once", "3 mg", "10:00", 0, "Oral"),
    drug("fosnetupitant", "FOSNETUPITANT + PALONOSETRON",
      "300 mg = 300 mg, Per Oral Once, over 30 Minutes,\nBefore chemotherapy", "300 mg", "10:00", 0, "Oral",
      { modification: "Modified: ↓ 25%", modReason: "Cardiotoxicity G4" }),
    drug("doxorubicin", "DOXORUBICIN",
      "40 mg/m² = 61.20 mg, Intravenous, in 250 ml Oncof Normal Saline, over 1 Hours as Infusion", "45 mg", "10:15", 60),
    drug("dexamethasone", "DEXAMETHASONE",
      "8 mg = 8 mg, Intravenous, in 100 ml Normal Saline as Bolus", "8 mg", "11:30", 15),
    drug("potassium", "POTASSIUM CHLORIDE",
      "10 ml = 10 ml, Intravenous, in 500 ml Normal Saline, over 2 Hours as Infusion, add 2 cc MgSO₄", "10 ml", "11:30", 120,
      "Intravenous", { modification: "Modified: ↓ 25%", modReason: "Cardiotoxicity G4" }),
    drug("magnesium", "MAGNESIUM SULPHATE",
      "2 ml = 2 ml, Intravenous Peripheral Line, in 500 ml Oncof Normal Saline as Infusion, add 10 cc KCl, 1 pint before and 1 pint after Ifosfamide",
      "2 ml", "11:30", 60),
    drug("ifosfamide", "IFOSFAMIDE WITH MESNA",
      "1.80 gms/m² = 2.75 gms, Intravenous, in 500 ml Oncof Normal Saline, over 2 Hours as Infusion. For doses more than 4 gm, can dilute in 1000 ml NS",
      "2 mg", "12:00", 120),
    drug("mesna", "MESNA",
      "600 mg/m² = 918 mg, Intravenous Peripheral Line as Bolus, IV bolus at 0, 3 and 6 hrs after Ifosfamide infusion",
      "900 mg", "14:00", 30),
    drug("filgrastim", "FILGRASTIM PEG", "6 mg = 6 mg, Subcutaneous once", "6 mg", "11:30", 0, "Subcutaneous"),
  ],
  breast: [
    drug("dexamethasone", "DEXAMETHASONE", "Premedication • route and dose per signed order", "Order-specific", "09:00", 20),
    drug("doxorubicin", "DOXORUBICIN", "Anthracycline • verify cumulative dose and authorised order", "Order-specific", "09:30", 45),
    drug("cyclophosphamide", "CYCLOPHOSPHAMIDE", "Verify preparation, infusion rate and route", "Order-specific", "10:30", 60),
  ],
  colon: [
    drug("palonosetron", "PALONOSETRON", "Premedication • per signed order", "Order-specific", "09:00", 15),
    drug("oxaliplatin", "OXALIPLATIN", "Infusion • verify compatibility and signed order", "Order-specific", "09:30", 120),
    drug("leucovorin", "LEUCOVORIN", "Infusion • per signed order", "Order-specific", "09:30", 120),
    drug("fluorouracil", "FLUOROURACIL", "Bolus or infusion only as authorised", "Order-specific", "12:00", 30),
  ],
  her2: [
    drug("dexamethasone", "DEXAMETHASONE", "Premedication • per signed order", "Order-specific", "09:00", 20),
    drug("paclitaxel", "PACLITAXEL", "Infusion • observe for hypersensitivity", "Order-specific", "09:30", 180),
    drug("trastuzumab", "TRASTUZUMAB", "HER2-targeted therapy • verify authorised order", "Order-specific", "13:00", 90),
  ],
  lymphoma: [
    drug("rituximab", "RITUXIMAB", "Infusion • verify signed order and monitoring plan", "Order-specific", "09:00", 180),
    drug("cyclophosphamide", "CYCLOPHOSPHAMIDE", "Infusion • per signed order", "Order-specific", "12:30", 60),
    drug("doxorubicin", "DOXORUBICIN", "Verify vesicant precautions", "Order-specific", "13:30", 30),
    drug("vincristine", "VINCRISTINE", "IV ONLY • verify route with second practitioner", "Order-specific", "14:00", 20),
  ],
  ovarian: [
    drug("dexamethasone", "DEXAMETHASONE", "Premedication • per signed order", "Order-specific", "09:00", 20),
    drug("paclitaxel", "PACLITAXEL", "Infusion • monitor for reaction", "Order-specific", "09:30", 180),
    drug("carboplatin", "CARBOPLATIN", "Verify calculated dose and signed order", "Order-specific", "13:00", 60),
  ],
};

export const SITE_OPTIONS = [
  "Left upper limb",
  "Right upper limb",
  "Left lower limb",
  "Right lower limb",
  "Central line",
  "Port",
  "Oral",
  "Subcutaneous",
];
export const defaultSite = (d) =>
  d.route === "Oral" ? "Oral" : d.route === "Subcutaneous" ? "Subcutaneous" : "Left upper limb";

export const getDrugs = (patient) => regimenDrugs[patient.regimen] || [];

// Tolerance history for the lead patient (matches the "Previous cycle" design).
const toleranceSeed = {
  "CU/33291": {
    olanzapine: { tolerance: "stable", description: "Patient fine" },
    fosnetupitant: { tolerance: "adr", grade: 3, description: "Seizure and lost consciousness" },
    doxorubicin: { tolerance: "adr", grade: 3, description: "Seizure and lost consciousness" },
    dexamethasone: { tolerance: "stable", description: "" },
    potassium: { tolerance: "stable", description: "Patient fine" },
    magnesium: { tolerance: "stable", description: "" },
    ifosfamide: { tolerance: "stable", description: "" },
    mesna: { tolerance: "stable", description: "Patient fine" },
    filgrastim: { tolerance: "stable", description: "Patient fine" },
  },
};

// Pre-existing nurse-recorded administration for completed days (and the first
// `savedToday` rows of the current day). Derived, so it is never stored.
export function seedRecord(patient, drugList, cycle, day, drugId) {
  const idx = drugList.findIndex((d) => d.id === drugId);
  if (idx < 0) return null;
  const past = cycle < patient.currentCycle || (cycle === patient.currentCycle && day < patient.currentDay);
  const today = cycle === patient.currentCycle && day === patient.currentDay;
  if (!(past || (today && idx < patient.savedToday))) return null;
  const d = drugList[idx];
  const tol = toleranceSeed[patient.id]?.[d.id] || { tolerance: "stable", description: "" };
  const [h, m] = d.start.split(":").map(Number);
  const end = d.duration ? `${String(Math.floor((h * 60 + m + d.duration) / 60) % 24).padStart(2, "0")}:${String((h * 60 + m + d.duration) % 60).padStart(2, "0")}` : "";
  return {
    status: "given",
    start: d.start,
    end,
    route: defaultSite(d),
    ...tol,
    saved: true,
    nurse: "Asha Patil",
    seeded: true,
  };
}
