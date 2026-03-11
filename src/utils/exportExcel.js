import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportarExcel = async (gastos) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Gastos de Março");

    worksheet.columns = [
        { header: "Nome do Gasto", key: "nome",  width: 30 },
        { header: "Categoria",     key: "cat",   width: 20 },
        { header: "Valor (R$)",    key: "valor", width: 15 },
    ];

    gastos.forEach(g => {
        worksheet.addRow({ nome: g.nome, cat: g.cat, valor: g.valor / 100 });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF34D399" },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    saveAs(new Blob([buffer]), `Planilha_Gastos_${now}.xlsx`);
};
