import { addDays } from "./time";

export const CYCLE_LENGTH_DAYS = 21;

// First day of a given cycle, derived from the patient's "today" anchor so that
// every cycle/day date shown anywhere in the app stays consistent.
export const cycleStartDate = (patient, cycle) => {
  const anchor = new Date(`${patient.currentDate}T00:00:00`);
  const currentCycleStart = addDays(anchor, -(patient.currentDay - 1));
  return addDays(currentCycleStart, (cycle - patient.currentCycle) * CYCLE_LENGTH_DAYS);
};
export const dayDate = (patient, cycle, day) =>
  addDays(cycleStartDate(patient, cycle), day - 1);

export const isPastCycle = (p, cycle) => cycle < p.currentCycle;
export const isFutureDay = (p, cycle, day) =>
  cycle > p.currentCycle || (cycle === p.currentCycle && day > p.currentDay);
export const isPastDay = (p, cycle, day) =>
  cycle < p.currentCycle || (cycle === p.currentCycle && day < p.currentDay);

// The chemo day that follows (cycle, day) according to the patient's schedule.
export const nextDay = (p, cycle, day) => {
  const i = p.days.indexOf(day);
  if (i >= 0 && i < p.days.length - 1) return { cycle, day: p.days[i + 1] };
  return { cycle: cycle + 1, day: p.days[0] };
};
export const keyOf = (patientId, cycle, day, drugId) =>
  `${patientId}|${cycle}|${day}|${drugId}`;
export const dayKey = (patientId, cycle, day) => `${patientId}|${cycle}|${day}`;
