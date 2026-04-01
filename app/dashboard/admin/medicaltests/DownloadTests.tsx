import ExcelJS from 'exceljs';
import { MedicalTest } from "./actions";

export const downloadTestsExcel = async (tests: MedicalTest[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Medical Tests");
    
    worksheet.columns = [
        { header: "Row #", key: "rowNumber", width: 10 },
        { header: "Test Name", key: "name", width: 30 },
        { header: "Category", key: "category", width: 20 },
        { header: "Unit (UOM)", key: "unit", width: 15 },
        { header: "Normal Min", key: "min", width: 15 },
        { header: "Normal Max", key: "max", width: 15 }
    ];
    
    tests.forEach((test, index) => {
        worksheet.addRow({
            rowNumber: index + 1,
            name: test.name,
            category: test.category,
            unit: test.unit,
            min: test.normalmin,
            max: test.normalmax
        });
    });
    
    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MedicalTests.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};