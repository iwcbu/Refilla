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
        card2: "#202835",
        border: "rgba(255,255,255,0.10)",
        border2:"#94a3b8",
        yes: "#000000",
        no: "#ffffff",

        ticketBubble: "#9fb7f3",
      }
      : {
        bg: "#f6f7fb",
        bg2: "#ebecf2",
        card: "#ffffff",
        card2: "#ffffff",
        text: "#0f172a",
        subtext: "#64748b",
        border: "rgba(0,0,0,0.08)",
        border2: "rgba(0, 0, 0, 0.1)",
        yes: "#ffffff",
        no: "#000000",
        
        ticketBubble: "#344e8b",
      };
}
