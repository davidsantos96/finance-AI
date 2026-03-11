import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmt } from "./currency";

// ── Desenha o gráfico de pizza (donut) em um canvas off-screen ────────────────
function gerarGraficoPizza(categorias, totalGastos) {
    const SIZE = 300;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const outerR = 120;
    const innerR = 60;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    // Fundo escuro (combina com o estilo do app)
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, SIZE, SIZE);

    if (!categorias || categorias.length === 0) return canvas.toDataURL("image/png");

    let startAngle = -Math.PI / 2;

    categorias.forEach(cat => {
        const slice = (cat.valor / totalGastos) * 2 * Math.PI;

        // Fatia
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = cat.cor || "#64748b";
        ctx.fill();

        // Brilho nas bordas
        ctx.strokeStyle = "#0d1117";
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle += slice;
    });

    // Buraco central (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#0d1117";
    ctx.fill();

    // Texto central: % comprometida
    const pct = totalGastos > 0
        ? Math.round((categorias.reduce((a, c) => a + c.valor, 0) / totalGastos) * 100)
        : 0;

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.min(pct, 100)}%`, cx, cy - 8);

    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.fillText("dos gastos", cx, cy + 14);

    return canvas.toDataURL("image/png");
}

// ── Exportação principal ──────────────────────────────────────────────────────
export const exportarPDF = (salario, gastos, totalGastos, porcentagemComprometida, saldo, insights) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString("pt-BR");

    // ── Cabeçalho ─────────────────────────────────────────────────────────────
    doc.setFillColor(8, 11, 18);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(52, 211, 153);
    doc.setFontSize(22);
    doc.text("Relatório Financeiro AI", 14, 25);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${now}`, 14, 32);

    // ── Resumo ────────────────────────────────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.text("Resumo Mensal", 14, 52);

    autoTable(doc, {
        startY: 56,
        head: [["Descrição", "Valor", "%"]],
        body: [
            ["Salário Total", fmt(salario), "100%"],
            ["Total de Gastos", fmt(totalGastos), `${porcentagemComprometida}%`],
            ["Saldo Livre", fmt(saldo), `${(100 - parseFloat(porcentagemComprometida)).toFixed(1)}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [52, 211, 153], textColor: [0, 0, 0], fontStyle: "bold" },
        bodyStyles: { textColor: [30, 30, 30] },
    });

    // ── Tabela de gastos ──────────────────────────────────────────────────────
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Detalhamento dos Gastos", 14, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Item", "Categoria", "Valor", "%"]],
        body: gastos.map(g => [
            g.nome,
            g.cat || "Pendente",
            fmt(g.valor),
            `${((g.valor / (totalGastos || 1)) * 100).toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // ── Página 2: Gráficos ────────────────────────────────────────────────────
    doc.addPage();

    // Cabeçalho da página 2
    doc.setFillColor(8, 11, 18);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(52, 211, 153);
    doc.setFontSize(16);
    doc.text("Análise Visual dos Gastos", 14, 20);

    // Agrupar por categoria para os gráficos
    const byCat = {};
    gastos.forEach(g => {
        const nome = g.cat || "Outros";
        if (!byCat[nome]) byCat[nome] = { valor: 0, cor: g.cor || "#64748b" };
        byCat[nome].valor += Number(g.valor) || 0;
        if (g.cor) byCat[nome].cor = g.cor;
    });
    const catItems = Object.entries(byCat)
        .map(([nome, v]) => ({ nome, valor: v.valor, cor: v.cor }))
        .sort((a, b) => b.valor - a.valor);

    // ── Gráfico pizza (donut) ─────────────────────────────────────────────────
    try {
        const imgData = gerarGraficoPizza(catItems, totalGastos);
        // Centralizado no topo da página 2 (60×60 mm)
        doc.addImage(imgData, "PNG", 75, 38, 60, 60);
    } catch (e) {
        console.warn("Erro ao gerar gráfico de pizza:", e);
    }

    // ── Gráfico de barras horizontais ─────────────────────────────────────────
    const barSectionY = 108;
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("Distribuição por Categoria", 14, barSectionY);

    const chartLeft = 14;
    const barMaxW = 100;
    const maxVal = Math.max(...catItems.map(i => i.valor), 1);
    let barY = barSectionY + 7;

    catItems.slice(0, 8).forEach(it => {
        const barW = (it.valor / maxVal) * barMaxW;
        const pct = totalGastos > 0 ? ((it.valor / totalGastos) * 100).toFixed(1) + "%" : "0.0%";

        // Nome da categoria
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(it.nome, chartLeft, barY + 4);

        // Fundo da barra
        doc.setFillColor(220, 225, 235);
        doc.roundedRect(chartLeft + 52, barY - 1, barMaxW, 7, 2, 2, "F");

        // Barra colorida
        try {
            const hex = (it.cor || "#64748b").replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            doc.setFillColor(r, g, b);
        } catch {
            doc.setFillColor(100, 116, 139);
        }
        if (barW > 0) doc.roundedRect(chartLeft + 52, barY - 1, barW, 7, 2, 2, "F");

        // Valor e %
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(`${fmt(it.valor)}  (${pct})`, chartLeft + 52 + barMaxW + 4, barY + 4);

        barY += 12;
    });

    // ── Página de insights da IA ──────────────────────────────────────────────
    if (insights) {
        doc.addPage();

        doc.setFillColor(8, 11, 18);
        doc.rect(0, 0, 210, 30, "F");
        doc.setTextColor(52, 211, 153);
        doc.setFontSize(16);
        doc.text("Análise da IA", 14, 20);

        let y = 42;

        // Conselho
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(12, y - 6, 186, 10 + doc.splitTextToSize(insights.analiseIA || "", 178).length * 6, 3, 3, "F");
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.text("Conselho do Especialista", 18, y);
        y += 7;
        doc.setFontSize(10);
        const analiseLines = doc.splitTextToSize(insights.analiseIA || "", 178);
        doc.text(analiseLines, 18, y);
        y += analiseLines.length * 6 + 12;

        // Alerta
        doc.setFillColor(255, 241, 242);
        doc.roundedRect(12, y - 6, 186, 20, 3, 3, "F");
        doc.setTextColor(190, 18, 60);
        doc.setFontSize(11);
        doc.text("⚠ Alerta", 18, y);
        y += 7;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(insights.alerta || "", 178), 18, y);
        y += 20;

        // Positivo
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(12, y - 6, 186, 20, 3, 3, "F");
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(11);
        doc.text("✓ Ponto Positivo", 18, y);
        y += 7;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(insights.positivo || "", 178), 18, y);
    }

    doc.save(`Relatorio_Financeiro_${now.replace(/\//g, "-")}.pdf`);
};