import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/base.css";
import "./styles/topbar.css";
import "./styles/entry.css";
import "./styles/patient-header.css";
import "./styles/administration.css";
import "./styles/discharge.css";
import "./styles/overlays.css";

createRoot(document.getElementById("root")).render(<App />);
