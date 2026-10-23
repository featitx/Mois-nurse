# MOIS Nurse – Chemotherapy Administration (React + Vite)

Nurse module of the Medical Oncology Information System. All patient data is **fictional**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Demo login
Any non-empty username/password works. Three fictional nurses are recognised by ID:
`125816` Asha Shinde, `125902` Rohan Pawar, `126044` Priya Nair (from the design: `125816` / `TMH12345*`).
The session is intentionally **not** persisted (reload = logged out, as in a real ward handover).
Settings (account menu) has **Reset demo data**.

## Journey
Login → Recent patients / search → patient (cycle + day) → drug administration
(Given / Not Given, start/end, site/route, Stable / ADR G1–G5 + description) → Save / Clear →
Clinical Notes · Nurse Notes · Vitals · Allergies/Comorbidities → Complete Administration →
Discharge Summary (print) → Log out / re-login (handover).

## Data model (what is stored)
* Seed data in `src/data/*` is derived (never stored). Doctor-authorised orders (drug, dose, route, duration)
  come from the regimen; nurse-recorded administration (status, times, site, tolerance) is kept separately.
* Only nurse edits are written to `localStorage` (`mois-nurse-v3-*`).
* **Doses/regimens are placeholder demo values copied from the design – not clinical guidance.**

## Responsive ranges (single source of truth in CSS)
| Range | Query |
|---|---|
| Laptop/desktop | `min-width: 1200px` (design reference, 1194px wide PNGs also render identically) |
| Tablet | `768px – 1199px` |
| Mobile | `max-width: 767px` |

The patient header never scrolls horizontally above 767px; the drug table scrolls horizontally on tablet/mobile.

## Structure
```
src/App.jsx              app state, session, routing between screens
src/components/          Header, Entry (login/search), PatientHeader, Administration,
                         DischargeSummary, Drawers, Modals, Icons
src/data/                patients, clinical, nurses (fictional)
src/utils/               time, schedule, admin (validation), vitals (illustrative highlight limits)
src/styles/              base, topbar, entry, patient-header, administration, discharge, overlays
```
