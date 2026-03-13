import { useState, useEffect } from "react";
import { Download, X, FileText, Sheet } from "lucide-react";

/**
 * Aparece 5s após o primeiro gasto ser adicionado.
 * Agora que há localStorage, lembra o usuário de exportar o relatório
 * (não mais sobre perda de dados — os dados ficam salvos no navegador).
 * Aparece apenas uma vez por sessão.
 */
export default function SaveReminderToast({ gastosCount, onExportPDF, onExportExcel }) {
    const [visible, setVisible] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (gastosCount > 0 && !shown) {
            const t = setTimeout(() => { setVisible(true); setShown(true); }, 5000);
            return () => clearTimeout(t);
        }
    }, [gastosCount, shown]);

    const dispensar = () => {
        setSaindo(true);
        setTimeout(() => { setVisible(false); setSaindo(false); }, 350);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: `translateX(-50%) translateY(${saindo ? "120%" : "0"})`,
            transition: "transform .35s cubic-bezier(.4,0,.2,1), opacity .35s",
            opacity: saindo ? 0 : 1,
            zIndex: 999,
            width: "min(460px, calc(100vw - 32px))",
        }}>
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e2535 100%)",
                border: "1px solid #34d39944",
                borderRadius: 14,
                padding: "16px 18px",
                boxShadow: "0 8px 40px #00000088, 0 0 0 1px #34d39918",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}>
                {/* Topo */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                        flexShrink: 0, background: "#34d39922",
                        borderRadius: 8, padding: 6, marginTop: 1,
                    }}>
                        <Download size={18} color="#34d399" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>
                            Seus dados estão salvos no navegador
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                            Quer guardar um relatório completo com gráficos e análise da IA?
                            Exporte em PDF ou Excel.
                        </p>
                    </div>

                    <button
                        onClick={dispensar}
                        style={{
                            flexShrink: 0, background: "none", border: "none",
                            color: "#475569", cursor: "pointer", padding: 2,
                            lineHeight: 1, borderRadius: 4, transition: "color .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                        onMouseLeave={e => e.currentTarget.style.color = "#475569"}
                        title="Dispensar"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => { onExportPDF(); dispensar(); }}
                        style={{
                            flex: 1, display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 6,
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            border: "none", borderRadius: 8, color: "#fff",
                            cursor: "pointer", fontSize: 12, fontWeight: 700,
                            padding: "9px 0", boxShadow: "0 2px 10px #ef444433",
                            transition: "opacity .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        <FileText size={13} /> Exportar PDF
                    </button>

                    <button
                        onClick={() => { onExportExcel(); dispensar(); }}
                        style={{
                            flex: 1, display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 6,
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            border: "none", borderRadius: 8, color: "#fff",
                            cursor: "pointer", fontSize: 12, fontWeight: 700,
                            padding: "9px 0", boxShadow: "0 2px 10px #22c55e33",
                            transition: "opacity .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        <Sheet size={13} /> Exportar Excel
                    </button>

                    <button
                        onClick={dispensar}
                        style={{
                            background: "#1e2535", border: "1px solid #334155",
                            borderRadius: 8, color: "#64748b", cursor: "pointer",
                            fontSize: 11, padding: "9px 14px", transition: "all .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#475569"; e.currentTarget.style.color = "#94a3b8"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#64748b"; }}
                    >
                        Agora não
                    </button>
                </div>
            </div>
        </div>
    );
}