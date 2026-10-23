import { addMinutes } from "./time";

// Drugs without a duration (oral / single-shot) are recorded without an End Time.
export const needsEnd = (drug) => drug.duration > 0;

// Fields the nurse has actually entered (auto-filled times do not count).
export const touched = (r) =>
  !!r && (!!r.status || !!r.route || !!r.description?.trim() || !!r.grade || r.tolerance === "adr" || !!r.start || !!r.end);

/* The values shown / validated for a row. `autoStart` is the auto-populated start
   time (current time) that only the active row receives. */
export function effective(drug, r = {}, autoStart = "") {
  const start = r.start ?? autoStart ?? "";
  const end = r.end ?? (start && needsEnd(drug) ? addMinutes(start, drug.duration) : "");
  return {
    status: r.status || "",
    start,
    end,
    route: r.route || "",
    tolerance: r.tolerance || "stable",
    grade: r.grade || null,
    description: r.description || "",
  };
}

export function validate(drug, eff) {
  const missing = [];
  if (!eff.status) missing.push("Status");
  if (eff.status !== "not-given") {
    if (!eff.start) missing.push("Start Time");
    if (needsEnd(drug) && !eff.end) missing.push("End Time");
    if (!eff.route) missing.push("Site/Route");
  }
  if (eff.tolerance === "adr") {
    if (!eff.grade) missing.push("ADR Grade");
    if (!eff.description.trim()) missing.push("ADR Description");
  }
  return missing;
}
