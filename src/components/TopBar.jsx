import { TrendingUp, FileText, Table } from "lucide-react";

export default function TopBar({ onExportPDF, onExportExcel }) {
    return (
        <div style={{
            borderBottom: "1px solid #1e2535", background: "#0a0d14ee",
            padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={16} color="#34d399" />
                <span style={{ fontSize: 10, letterSpacing: 4, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Finance AI
                </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
                <button title="Exportar PDF" onClick={onExportPDF}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <FileText size={18} />
                </button>
                <button title="Exportar Excel" onClick={onExportExcel}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <Table size={18} />
                </button>
            </div>
        </div>
    );
}
