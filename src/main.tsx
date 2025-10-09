import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme from persisted preference or system preference
const persisted = (() => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
})();
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = persisted ?? (prefersDark ? "dark" : "light");
document.documentElement.classList.toggle("dark", initialTheme === "dark");

createRoot(document.getElementById("root")!).render(<App />);
