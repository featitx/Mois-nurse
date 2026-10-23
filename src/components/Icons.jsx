import React from "react";

const svg = (props, children) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false" {...props}>
    {children}
  </svg>
);
const stroke = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export const BackChevron = (p) => svg(p, <path d="M15 5l-7 7 7 7" {...stroke} strokeWidth={2.2} />);
export const ChevronDown = (p) => svg(p, <path d="M5 9l7 7 7-7" {...stroke} strokeWidth={2.4} />);
export const Close = (p) => svg(p, <path d="M5 5l14 14M19 5L5 19" {...stroke} strokeWidth={1.8} />);
export const Search = (p) =>
  svg(p, <><circle cx="10.5" cy="10.5" r="6" {...stroke} strokeWidth={2.2} /><path d="M15 15l5 5" {...stroke} strokeWidth={2.4} /></>);
export const Gear = (p) =>
  svg(p, <>
    <path d="M12 8.6a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8z" {...stroke} />
    <path d="M10.4 2.8h3.2l.5 2.4 1.7.7 2-1.4 2.3 2.3-1.4 2 .7 1.7 2.4.5v3.2l-2.4.5-.7 1.7 1.4 2-2.3 2.3-2-1.4-1.7.7-.5 2.4h-3.2l-.5-2.4-1.7-.7-2 1.4-2.3-2.3 1.4-2-.7-1.7-2.4-.5v-3.2l2.4-.5.7-1.7-1.4-2 2.3-2.3 2 1.4 1.7-.7z" {...stroke} strokeWidth={1.4} />
  </>);
export const User = (p) =>
  svg(p, <>
    <circle cx="12" cy="12" r="12" fill="currentColor" opacity=".0" />
    <circle cx="12" cy="9" r="4.2" fill="currentColor" />
    <path d="M3.6 20.4C5 16.6 8.2 15 12 15s7 1.6 8.4 5.4A12 12 0 0112 24a12 12 0 01-8.4-3.6z" fill="currentColor" />
  </>);
export const CheckCircle = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <>
    <circle cx="8" cy="8" r="6.6" {...stroke} strokeWidth={1.2} />
    <path d="M5 8.2l2 2 4-4.2" {...stroke} strokeWidth={1.3} />
  </>);
export const CrossCircle = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <>
    <circle cx="8" cy="8" r="6.6" {...stroke} strokeWidth={1.2} />
    <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" {...stroke} strokeWidth={1.3} />
  </>);
export const CheckFilled = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <>
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="M4.9 8.2l2.2 2.2 4-4.3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </>);
export const Calendar = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <>
    <rect x="1.8" y="2.8" width="12.4" height="11.4" rx="2" {...stroke} strokeWidth={1.2} />
    <path d="M1.8 6.2h12.4M5 1.6v2.6M11 1.6v2.6" {...stroke} strokeWidth={1.2} />
    <path d="M4.8 8.6h.01M8 8.6h.01M11.2 8.6h.01M4.8 11.4h.01M8 11.4h.01M11.2 11.4h.01" {...stroke} strokeWidth={1.6} />
  </>);
export const Lock = (p) =>
  svg(p, <>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" {...stroke} strokeWidth={1.6} />
    <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" {...stroke} strokeWidth={1.6} />
    <circle cx="12" cy="15.2" r="1.3" fill="currentColor" />
  </>);
export const LogOut = (p) =>
  svg(p, <>
    <path d="M10 4.5H6.5a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5H10" {...stroke} />
    <path d="M14 8l4 4-4 4M18 12H9.5" {...stroke} />
  </>);
export const Check = (p) => svg(p, <path d="M5 12.6l4.4 4.4L19 7.4" {...stroke} strokeWidth={2.6} />);
export const CheckBig = (p) => svg({ viewBox: "0 0 64 64", ...p }, <path d="M17.5 33.5l10 10 19-20" {...stroke} strokeWidth={3.6} />);
export const Exclaim = (p) =>
  svg(p, <><path d="M12 5.5v6" {...stroke} strokeWidth={5} /><circle cx="12" cy="18.4" r="2.6" fill="currentColor" /></>);
export const Mic = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <>
    <rect x="5.6" y="1.6" width="4.8" height="8" rx="2.4" {...stroke} strokeWidth={1.2} />
    <path d="M3.4 7.6a4.6 4.6 0 009.2 0M8 12.2v2.2" {...stroke} strokeWidth={1.2} />
  </>);
export const Plus = (p) => svg({ viewBox: "0 0 16 16", ...p }, <path d="M8 3v10M3 8h10" {...stroke} strokeWidth={1.7} />);
export const Pencil = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <path d="M1.8 14.2l.9-3.7 8.3-8.3a1.6 1.6 0 012.3 0l.5.5a1.6 1.6 0 010 2.3l-8.3 8.3zM9.6 3.6l2.8 2.8" fill="currentColor" stroke="currentColor" strokeWidth=".8" strokeLinejoin="round" />);
export const Trash = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <path d="M1.8 3.8h12.4M5.8 3.8V2h4.4v1.8M3 3.8l.9 9.6c0 .4.3.6.6.6h7c.3 0 .6-.2.6-.6l.9-9.6" {...stroke} strokeWidth={1.3} strokeLinejoin="round" />);
export const Cog = (p) =>
  svg({ viewBox: "0 0 16 16", ...p }, <>
    <circle cx="8" cy="8" r="2.2" {...stroke} strokeWidth={1.2} />
    <path d="M6.7 1.6h2.6l.4 1.7 1.2.5 1.5-.9 1.8 1.8-.9 1.5.5 1.2 1.7.4v2.6l-1.7.4-.5 1.2.9 1.5-1.8 1.8-1.5-.9-1.2.5-.4 1.7H6.7l-.4-1.7-1.2-.5-1.5.9-1.8-1.8.9-1.5-.5-1.2-1.7-.4V6.7l1.7-.4.5-1.2-.9-1.5 1.8-1.8 1.5.9 1.2-.5z" {...stroke} strokeWidth={1} />
  </>);
