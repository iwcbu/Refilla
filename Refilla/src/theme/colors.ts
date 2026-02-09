import { usePrefs } from "../context/prefs";

export function useColors() {
  const { prefs } = usePrefs();
  const dark = prefs.dark

  return dark
    ? {
        bg: "#0b1220",
        text: "#e5e7eb",
        subtext: "#94a3b8",
        card: "#0f172a",
        border: "rgba(255,255,255,0.10)",
        card2: "#202835",
        border2:"#94a3b8",
      }
    : {
        bg: "#f6f7fb",
        card: "#ffffff",
        text: "#0f172a",
        subtext: "#64748b",
        border: "rgba(0,0,0,0.08)",
      };
}
