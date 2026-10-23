// Highlighting only. These cut-offs are ILLUSTRATIVE DEFAULTS used to tint a
// reading pink in the UI; they are not clinical decision support. Replace with
// your unit's early-warning policy before any real use.
export const VITAL_LIMITS = {
  temp: { max: 100.4 },
  pulse: { min: 50, max: 100 },
  spo2: { min: 94 },
  resp: { min: 10, max: 20 },
};

export const parseBp = (bp) => {
  const m = /^\s*(\d{2,3})\s*\/\s*(\d{2,3})\s*$/.exec(bp || "");
  return m ? { sys: +m[1], dia: +m[2] } : null;
};

export const flagVitals = (v) => {
  const flags = [];
  const n = (x) => (x === "" || x == null ? NaN : Number(x));
  const out = (val, lim) =>
    !Number.isNaN(val) &&
    ((lim.min != null && val < lim.min) || (lim.max != null && val > lim.max));
  if (out(n(v.temp), VITAL_LIMITS.temp)) flags.push("temp");
  if (out(n(v.pulse), VITAL_LIMITS.pulse)) flags.push("pulse");
  if (out(n(v.spo2), VITAL_LIMITS.spo2)) flags.push("spo2");
  if (out(n(v.resp), VITAL_LIMITS.resp)) flags.push("resp");
  const bp = parseBp(v.bp);
  if (bp && (bp.sys <= 90 || bp.sys >= 160 || bp.dia <= 60 || bp.dia >= 100)) flags.push("bp");
  return flags;
};

export const VITAL_FIELDS = [
  { key: "temp", label: "Temperature", unit: "ºF", fmt: (v) => `${v}ºF` },
  { key: "pulse", label: "Pulse", unit: "p/min", fmt: (v) => `${v} p/min` },
  { key: "spo2", label: "SpO₂", unit: "%", fmt: (v) => `${v} %` },
  { key: "resp", label: "Respiratory Rate", unit: "r/min", fmt: (v) => `${v} r/min` },
  { key: "bp", label: "Blood Pressure", unit: "mmHg", fmt: (v) => `${v} mmHg` },
];
