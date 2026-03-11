import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmt } from "./currency";

export const exportarPDF = (salario, gastos, totalGastos, porcentagemComprometida, saldo, insights) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString("pt-BR");

    // Cabeçalho
    doc.setFillColor(8, 11, 18);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(52, 211, 153);
    doc.setFontSize(22);
    doc.text("Relatório Financeiro AI", 14, 25);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${now}`, 14, 32);

    // Resumo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Resumo Mensal", 14, 55);

    autoTable(doc, {
        startY: 60,
        head: [["Descrição", "Valor", "%"]],
        body: [
            ["Salário Total",   fmt(salario),      "100%"],
            ["Total de Gastos", fmt(totalGastos),  `${porcentagemComprometida}%`],
            ["Saldo Livre",     fmt(saldo),         `${(100 - parseFloat(porcentagemComprometida)).toFixed(1)}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [52, 211, 153], textColor: [0, 0, 0] },
    });

    // Tabela de gastos
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Item", "Categoria", "Valor", "%"]],
        body: gastos.map(g => [
            g.nome,
            g.cat || "Pendente",
            fmt(g.valor),
            `${((g.valor / totalGastos) * 100).toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [30, 37, 53], textColor: [255, 255, 255] },
    });

    // Página de insights da IA
    if (insights) {
        doc.addPage();
        doc.setTextColor(52, 211, 153);
        doc.setFontSize(18);
        doc.text("Análise da IA", 14, 25);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Conselho do Especialista:", 14, 40);
        const splitText = doc.splitTextToSize(insights.analiseIA, 180);
        doc.text(splitText, 14, 50);

        doc.setTextColor(190, 18, 60);
        doc.text("Alerta:", 14, doc.lastAutoTable?.finalY + 80 || 100);
        doc.setTextColor(0, 0, 0);
        doc.text(insights.alerta, 14, doc.lastAutoTable?.finalY + 90 || 110);
    }

    doc.save(`Relatorio_Financeiro_${now.replace(/\//g, "-")}.pdf`);
};
