// Small date/time helpers shared by the whole app.
export const pad2 = (n) => String(n).padStart(2, "0");

export const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMinutes = (x) => {
  const v = ((x % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(v / 60))}:${pad2(v % 60)}`;
};
export const addMinutes = (t, d) => (t ? fromMinutes(toMinutes(t) + d) : "");
export const nowHHMM = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// "14:30" -> "02:30 PM"
export const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${pad2(h % 12 || 12)}:${pad2(m)} ${h >= 12 ? "PM" : "AM"}`;
};
// "14:30" -> "02:30pm"
export const fmt12Compact = (t) => fmt12(t).replace(" ", "").toLowerCase();

export const fmtDate = (d) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
