import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'sicom';

interface ExportOptions {
  filename: string;
  title?: string;
  headers: string[];
  data: (string | number)[][];
}

export const exportToCSV = ({ filename, headers, data }: ExportOptions) => {
  const csvContent = [
    headers.join(';'),
    ...data.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');
  
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportToExcel = ({ filename, title, headers, data }: ExportOptions) => {
  const worksheetData = [headers, ...data];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Auto-width columns
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => String(row[i] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet['!cols'] = colWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title || 'Dados');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = ({ filename, title, headers, data }: ExportOptions) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title || filename, 14, 20);
  
  // Subtitle with date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
  
  // Table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 35 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount} • Sistema MROSC Unaí/MG`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportToSICOM = ({ filename, headers, data }: ExportOptions) => {
  // SICOM format: uppercase headers, pipe-separated or semicolon-separated
  const sicomHeaders = headers.map(h => h.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_'));
  
  const csvContent = [
    sicomHeaders.join(';'),
    ...data.map(row => row.map(cell => {
      const cellStr = String(cell).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return `"${cellStr}"`;
    }).join(';'))
  ].join('\r\n');
  
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_SICOM.csv`;
  link.click();
};

export const exportData = (format: ExportFormat, options: ExportOptions) => {
  switch (format) {
    case 'csv':
      exportToCSV(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPDF(options);
      break;
    case 'sicom':
      exportToSICOM(options);
      break;
  }
};
