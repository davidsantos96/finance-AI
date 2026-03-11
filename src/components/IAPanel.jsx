import { Sparkles, Loader2 } from "lucide-react";

export default function IAPanel({ onAnalisar, analisando }) {
    return (
        <div style={{
            marginBottom: 32, padding: 20, borderRadius: 20,
            background: analisando
                ? "linear-gradient(135deg, #1e2535, #0d1117)"
                : "linear-gradient(135deg, #0d1117, #0a0d14)",
            border: "1px solid #34d39933", position: "relative", overflow: "hidden"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                        <Sparkles size={16} color="#34d399" />
                        Inteligência Artificial
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        Classifique gastos e receba insights financeiros.
                    </div>
                </div>
                <button
                    onClick={onAnalisar}
                    disabled={analisando}
                    style={{
                        background: "#34d399", color: "#000", border: "none",
                        padding: "10px 20px", borderRadius: 12, fontWeight: 700,
                        fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)", transition: "all 0.2s"
                    }}
                >
                    {analisando ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {analisando ? "Analisando..." : "Analisar Agora"}
                </button>
            </div>
        </div>
    );
}
