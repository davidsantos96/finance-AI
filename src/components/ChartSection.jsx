import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../utils/currency";

function AnimatedBar({ valor, total, cor, delay = 0 }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth((valor / total) * 100), delay);
        return () => clearTimeout(t);
    }, [valor, total]);
    return (
        <div style={{ height: 5, background: "#1e2535", borderRadius: 99, overflow: "hidden", flex: 1 }}>
            <div style={{
                height: "100%", borderRadius: 99, background: cor,
                width: `${width}%`, transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
                boxShadow: `0 0 6px ${cor}88`
            }} />
        </div>
    );
}

function CustomTooltip({ active, payload, total }) {
    if (active && payload?.length) {
        const d = payload[0];
        return (
            <div style={{ background: "#0d1117", border: `1px solid ${d.payload.cor}55`, borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ color: d.payload.cor, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{d.payload.nome}</div>
                <div style={{ color: "#f1f5f9", fontSize: 15, fontFamily: "monospace", marginTop: 2 }}>{fmt(d.value)}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{((d.value / total) * 100).toFixed(1)}%</div>
            </div>
        );
    }
    return null;
}

export default function ChartSection({ categorias, totalGastos, hov, onHov }) {
    if (categorias.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                Nenhum gasto registrado.
            </div>
        );
    }

    return (
        <div className="chart-grid">
            <div className="pie-container">
                <PieChart width={170} height={170}>
                    <Pie
                        data={categorias} dataKey="valor"
                        cx={80} cy={80} innerRadius={50} outerRadius={80} paddingAngle={3}
                        onMouseEnter={(_, i) => onHov(categorias[i].nome)}
                        onMouseLeave={() => onHov(null)}
                    >
                        {categorias.map(c => (
                            <Cell key={c.nome} fill={c.cor}
                                opacity={hov === null || hov === c.nome ? 1 : 0.2}
                                style={{
                                    cursor: "pointer",
                                    filter: hov === c.nome ? `drop-shadow(0 0 8px ${c.cor}66)` : "none",
                                    transition: "all 0.3s"
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip total={totalGastos} />} />
                </PieChart>
            </div>
            <div className="legend-container">
                {categorias.sort((a, b) => b.valor - a.valor).map((c, i) => (
                    <div key={c.nome}
                        onMouseEnter={() => onHov(c.nome)}
                        onMouseLeave={() => onHov(null)}
                        style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                            borderRadius: 10, marginBottom: 4,
                            background: hov === c.nome ? "#111827" : "transparent",
                            transition: "background .15s", cursor: "default",
                        }}
                    >
                        <AnimatedBar valor={c.valor} total={totalGastos} cor={c.cor} delay={i * 60} />
                        <span style={{ fontSize: 10, color: "#94a3b8", minWidth: 70, textAlign: "right", fontFamily: "monospace" }}>
                            {fmt(c.valor)}
                        </span>
                        <span style={{ fontSize: 9, color: c.cor, minWidth: 35, fontWeight: 700 }}>
                            {((c.valor / totalGastos) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
