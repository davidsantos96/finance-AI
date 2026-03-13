import { useState, useEffect } from "react";
import { useFinance } from "./src/hooks/useFinance";
import { exportarPDF } from "./src/utils/exportPDF";
import { exportarExcel } from "./src/utils/exportExcel";

import TopBar from "./src/components/TopBar";
import SummaryCards from "./src/components/SummaryCards";
import IAPanel from "./src/components/IAPanel";
import IAInsights from "./src/components/IAInsights";
import AddExpenseForm from "./src/components/AddExpenseForm";
import Tabs from "./src/components/Tabs";
import ChartSection from "./src/components/ChartSection";
import ExpenseList from "./src/components/ExpenseList";
import SaveReminderToast from "./src/components/SaveReminderToast";

export default function App() {
    const [aba, setAba] = useState("geral");
    const [hov, setHov] = useState(null);
    const [mounted, setMounted] = useState(false);

    const {
        salario, setSalario,
        gastos,
        novoGasto, setNovoGasto,
        analisando, insights,
        inputDescRef,
        totalGastos, saldo, porcentagemComprometida, categorias,
        handleAddGasto, removeGasto, editarGasto, limparDados, analisarComIA,
    } = useFinance();

    useEffect(() => { setTimeout(() => setMounted(true), 120); }, []);

    const handleExportPDF = () =>
        exportarPDF(salario, gastos, totalGastos, porcentagemComprometida, saldo, insights);
    const handleExportExcel = () => exportarExcel(gastos);

    return (
        <div style={{
            fontFamily: "Inter, sans-serif",
            background: "linear-gradient(160deg,#080b12 0%,#0d1117 60%,#080b12 100%)",
            minHeight: "100vh", color: "#e2e8f0", paddingBottom: 60
        }}>
            <TopBar
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onLimpar={limparDados}
                temDados={gastos.length > 0}
            />

            <div className="main-container">
                <div style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(16px)",
                    transition: "all .6s ease", marginBottom: 20
                }}>
                    <SummaryCards
                        salario={salario}
                        onSalarioChange={setSalario}
                        totalGastos={totalGastos}
                        saldo={saldo}
                    />
                </div>

                <IAPanel onAnalisar={analisarComIA} analisando={analisando} />
                <IAInsights insights={insights} />

                <AddExpenseForm
                    novoGasto={novoGasto}
                    onChange={setNovoGasto}
                    onSubmit={handleAddGasto}
                    inputDescRef={inputDescRef}
                />

                <Tabs aba={aba} onAbaChange={setAba} />

                {aba === "geral" && (
                    <div className="chart-section">
                        <ChartSection
                            categorias={categorias}
                            totalGastos={totalGastos}
                            hov={hov}
                            onHov={setHov}
                        />
                    </div>
                )}

                {aba === "lista" && (
                    <ExpenseList
                        gastos={gastos}
                        onRemove={removeGasto}
                        onEdit={editarGasto}
                    />
                )}
            </div>

            <SaveReminderToast
                gastosCount={gastos.length}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
            />
        </div>
    );
}