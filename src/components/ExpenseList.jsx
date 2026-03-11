import { Trash2 } from "lucide-react";
import { fmt } from "../utils/currency";

export default function ExpenseList({ gastos, onRemove }) {
    if (gastos.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                Nenhum lançamento ainda.
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gastos.map(g => (
                <div key={g.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 14,
                    background: "#0d1117", border: "1px solid #1e2535",
                    transition: "all 0.2s"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 4, height: 32, borderRadius: 99, background: g.cor }} />
                        <div>
                            <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{g.nome}</div>
                            <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>
                                {g.cat}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 14, color: "#f1f5f9", fontWeight: 500 }}>
                            {fmt(g.valor)}
                        </div>
                        <button
                            onClick={() => onRemove(g.id)}
                            style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", padding: 6, transition: "color 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                            onMouseLeave={e => e.currentTarget.style.color = "#334155"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
