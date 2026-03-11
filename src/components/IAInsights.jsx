import { AlertTriangle, CheckCircle } from "lucide-react";

export default function IAInsights({ insights }) {
    if (!insights) return null;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <div style={{ background: "#12080a", border: "1px solid #7f1d1d33", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#f87171", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={12} /> Alerta IA
                </div>
                <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>{insights.alerta}</div>
            </div>
            <div style={{ background: "#080f0c", border: "1px solid #14532d33", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#34d399", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle size={12} /> Positivo IA
                </div>
                <div style={{ fontSize: 12, color: "#6ee7b7", lineHeight: 1.5 }}>{insights.positivo}</div>
            </div>
            <div style={{ gridColumn: "span 2", background: "#111827", border: "1px solid #1e2535", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#60a5fa", textTransform: "uppercase", marginBottom: 8 }}>
                    Conselho do Especialista
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>
                    "{insights.analiseIA}"
                </div>
            </div>
        </div>
    );
}
