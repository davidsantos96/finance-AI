export default function Tabs({ aba, onAbaChange }) {
    return (
        <div style={{ display: "flex", borderBottom: "1px solid #1e2535", marginBottom: 24 }}>
            {[["geral", "Análise"], ["lista", "Lançamentos"]].map(([id, label]) => (
                <button key={id} onClick={() => onAbaChange(id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "9px 20px", fontSize: 10, letterSpacing: 2,
                    color: aba === id ? "#f1f5f9" : "#334155",
                    borderBottom: aba === id ? "2px solid #34d399" : "2px solid transparent",
                    textTransform: "uppercase", fontWeight: 700, transition: "color 0.2s", marginBottom: -1
                }}>
                    {label}
                </button>
            ))}
        </div>
    );
}
