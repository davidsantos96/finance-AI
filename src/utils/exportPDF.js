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
            `${((g.valor / (totalGastos || 1)) * 100).toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [30, 37, 53], textColor: [255, 255, 255] },
    });

    // Gráfico de barras por categoria (pequeno)
    try {
        const chartStartY = doc.lastAutoTable.finalY + 12;
        const chartLeft = 14;
        const chartWidth = 180;

        // Agrupar por categoria
        const byCat = {};
        (gastos || []).forEach(g => {
            const nome = g.cat || 'Outros';
            if (!byCat[nome]) byCat[nome] = { valor: 0, cor: g.cor || '#64748b' };
            byCat[nome].valor += Number(g.valor) || 0;
            if (g.cor) byCat[nome].cor = g.cor;
        });

        const items = Object.entries(byCat).map(([nome, v]) => ({ nome, valor: v.valor, cor: v.cor }));
        items.sort((a, b) => b.valor - a.valor);

        if (items.length > 0) {
            // check space
            if (chartStartY + items.length * 12 + 40 > doc.internal.pageSize.getHeight()) {
                doc.addPage();
            }

            const maxVal = Math.max(...items.map(i => i.valor), 1);
            const barMaxWidth = chartWidth - 80; // space for labels

            doc.setFontSize(12);
            doc.setTextColor(100,116,139);
            doc.text('Distribuição por Categoria', chartLeft, doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 40);

            let y = (doc.lastAutoTable ? doc.lastAutoTable.finalY + 26 : chartStartY + 6);
            items.slice(0, 8).forEach((it) => {
                const barW = (it.valor / maxVal) * barMaxWidth;
                // label
                doc.setFontSize(10);
                doc.setTextColor(20,20,20);
                doc.text(it.nome, chartLeft, y + 5);
                // bar background
                doc.setFillColor(30,37,53);
                doc.rect(chartLeft + 60, y - 4, barMaxWidth, 8, 'F');
                // bar fill
                try {
                    const c = (it.cor || '#64748b').replace('#','');
                    const r = parseInt(c.substring(0,2),16);
                    const gcol = parseInt(c.substring(2,4),16);
                    const b = parseInt(c.substring(4,6),16);
                    doc.setFillColor(r, gcol, b);
                } catch(e) {
                    doc.setFillColor(100,100,100);
                }
                doc.rect(chartLeft + 60, y - 4, barW, 8, 'F');
                // value text
                doc.setFontSize(9);
                doc.setTextColor(124,139,152);
                const pct = totalGastos > 0 ? ((it.valor/totalGastos)*100).toFixed(1) + '%' : '0.0%';
                doc.text(pct, chartLeft + 60 + barMaxWidth + 6, y + 5);

                y += 12;
            });
        }
    } catch (e) {
        console.warn('Erro ao desenhar gráfico no PDF', e);
    }

    // Página de insights da IA (se houver)
    if (insights) {
        doc.addPage();
        doc.setTextColor(52, 211, 153);
        doc.setFontSize(18);
        doc.text("Análise da IA", 14, 25);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Conselho do Especialista:", 14, 40);
        const splitText = doc.splitTextToSize(insights.analiseIA || '', 180);
        doc.text(splitText, 14, 50);

        doc.setTextColor(52, 211, 153);
        doc.setFontSize(12);
        doc.text("Resumo Rápido:", 14, doc.lastAutoTable?.finalY + 70 || 100);
        doc.setTextColor(0,0,0);
        const alerta = insights.alerta || '';
        const positivo = insights.positivo || '';
        const posSplit = doc.splitTextToSize(positivo, 180);
        const altSplit = doc.splitTextToSize(alerta, 180);

        doc.setTextColor(190, 18, 60);
        doc.text('Alerta:', 14, doc.lastAutoTable?.finalY + 80 || 110);
        doc.setTextColor(0,0,0);
        doc.text(altSplit, 14, doc.lastAutoTable?.finalY + 90 || 120);

        doc.setTextColor(52, 211, 153);
        doc.text('Positivo:', 14, doc.lastAutoTable?.finalY + 110 || 140);
        doc.setTextColor(0,0,0);
        doc.text(posSplit, 14, doc.lastAutoTable?.finalY + 120 || 150);
    }

    doc.save(`Relatorio_Financeiro_${now.replace(/\//g, "-")}.pdf`);
};
