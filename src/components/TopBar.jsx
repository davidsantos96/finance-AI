import { TrendingUp, FileText, Sheet, Trash2 } from "lucide-react";

export default function TopBar({ onExportPDF, onExportExcel, onLimpar, temDados }) {

    const confirmarLimpeza = () => {
        if (window.confirm("Apagar todos os dados salvos? Essa ação não pode ser desfeita.")) {
            onLimpar();
        }
    };

    return (
        <div style={{
            borderBottom: "1px solid #1e2535",
            background: "#0a0d14ee",
            padding: "10px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(10px)",
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={16} color="#34d399" />
                <span style={{
                    fontSize: 10, letterSpacing: 4, color: "#64748b",
                    textTransform: "uppercase", fontWeight: 700,
                }}>
                    Finance AI
                </span>
            </div>

            {/* Ações */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

                <span style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginRight: 2 }}>
                    EXPORTAR:
                </span>

                {/* PDF */}
                <button
                    onClick={onExportPDF}
                    title="Exportar como PDF"
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        border: "none", borderRadius: 8, color: "#fff",
                        cursor: "pointer", fontSize: 11, fontWeight: 700,
                        letterSpacing: 0.5, padding: "7px 14px",
                        boxShadow: "0 0 12px #ef444440",
                        transition: "all .2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px #ef444466"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 12px #ef444440"; }}
                >
                    <FileText size={13} /> PDF
                </button>

                {/* Excel */}
                <button
                    onClick={onExportExcel}
                    title="Exportar como Excel"
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        border: "none", borderRadius: 8, color: "#fff",
                        cursor: "pointer", fontSize: 11, fontWeight: 700,
                        letterSpacing: 0.5, padding: "7px 14px",
                        boxShadow: "0 0 12px #22c55e40",
                        transition: "all .2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px #22c55e66"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 12px #22c55e40"; }}
                >
                    <Sheet size={13} /> Excel
                </button>

                {/* Limpar dados — só aparece se houver dados */}
                {temDados && (
                    <>
                        <div style={{ width: 1, height: 20, background: "#1e2535", margin: "0 4px" }} />
                        <button
                            onClick={confirmarLimpeza}
                            title="Apagar todos os dados"
                            style={{
                                display: "flex", alignItems: "center", gap: 5,
                                background: "none",
                                border: "1px solid #334155",
                                borderRadius: 8, color: "#475569",
                                cursor: "pointer", fontSize: 11, fontWeight: 600,
                                padding: "6px 12px",
                                transition: "all .2s ease",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#f87171";
                                e.currentTarget.style.color = "#f87171";
                                e.currentTarget.style.background = "#f8717110";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#334155";
                                e.currentTarget.style.color = "#475569";
                                e.currentTarget.style.background = "none";
                            }}
                        >
                            <Trash2 size={12} /> Limpar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}