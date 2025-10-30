import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: any[];
  format?: 'excel' | 'pdf';
}

export const exportToExcel = (options: ExportOptions) => {
  const { filename, columns, data } = options;

  // Create worksheet data with headers
  const wsData = [
    columns.map(col => col.header),
    ...data.map(row => columns.map(col => row[col.key] || ''))
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (options: ExportOptions) => {
  const { filename, title, columns, data } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add title if provided
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  // Prepare table data
  const tableColumns = columns.map(col => col.header);
  const tableRows = data.map(row => columns.map(col => row[col.key] || ''));

  // Add table
  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: title ? 25 : 15,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 15, left: 14, right: 14 }
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
};

export const exportData = (options: ExportOptions) => {
  const format = options.format || 'excel';
  
  if (format === 'excel') {
    exportToExcel(options);
  } else if (format === 'pdf') {
    exportToPDF(options);
  }
};

// Utility function to format currency for export
export const formatCurrencyForExport = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toFixed(2)}`;
};

// Utility function to format date for export
export const formatDateForExport = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
