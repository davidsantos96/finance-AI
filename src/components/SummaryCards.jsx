import { fmt } from "../utils/currency";

export default function SummaryCards({ salario, onSalarioChange, totalGastos, saldo }) {
    return (
        <div className="summary-grid">
            <div className="summary-card">
                <div className="summary-label">Salário</div>
                <input
                    type="text"
                    value={salario === 0 ? "R$ 0,00" : fmt(salario)}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        onSalarioChange(raw ? parseInt(raw, 10) : 0);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="salary-input"
                />
            </div>
            <div className="summary-card">
                <div className="summary-label">Gastos</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#f87171", fontFamily: "monospace" }}>
                    {fmt(totalGastos)}
                </div>
            </div>
            <div className="summary-card saldo-card">
                <div className="summary-label">Saldo</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#60a5fa", fontFamily: "monospace" }}>
                    {fmt(saldo)}
                </div>
            </div>
        </div>
    );
}
