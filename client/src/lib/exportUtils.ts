import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Format currency for exports
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Format date for exports
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Export Party Ledger to PDF
export const exportPartyLedgerToPDF = (party: any, ledgerEntries: any[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Party Ledger Report', 14, 20);
  
  // Add party info
  doc.setFontSize(12);
  doc.text(`Party: ${party.name}`, 14, 30);
  doc.text(`Phone: ${party.phone}`, 14, 36);
  doc.text(`Balance: ${formatCurrency(party.balance || 0)}`, 14, 42);
  doc.text(`Type: ${party.type}`, 14, 48);
  
  // Prepare table data
  const tableData = ledgerEntries.map(entry => [
    formatDate(entry.date),
    entry.description,
    formatCurrency(entry.debit || 0),
    formatCurrency(entry.credit || 0),
    formatCurrency(entry.balance)
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 55,
    head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
  });
  
  // Save
  doc.save(`party-ledger-${party.name.replace(/\s+/g, '-')}.pdf`);
};

// Export Party Ledger to Excel
export const exportPartyLedgerToExcel = (party: any, ledgerEntries: any[]) => {
  const data = [
    ['Party Ledger Report'],
    [],
    ['Party:', party.name],
    ['Phone:', party.phone],
    ['Balance:', formatCurrency(party.balance || 0)],
    ['Type:', party.type],
    [],
    ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
    ...ledgerEntries.map(entry => [
      formatDate(entry.date),
      entry.description,
      formatCurrency(entry.debit || 0),
      formatCurrency(entry.credit || 0),
      formatCurrency(entry.balance)
    ])
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
  XLSX.writeFile(wb, `party-ledger-${party.name.replace(/\s+/g, '-')}.xlsx`);
};

// Export Inventory to PDF
export const exportInventoryToPDF = (inventoryItem: any, transactions: any[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Inventory Report', 14, 20);
  
  // Add inventory info
  doc.setFontSize(12);
  doc.text(`Crop: ${inventoryItem.cropName}`, 14, 30);
  if (inventoryItem.variety) {
    doc.text(`Variety: ${inventoryItem.variety}`, 14, 36);
  }
  doc.text(`Opening Stock: ${parseFloat(inventoryItem.openingStock).toFixed(2)} ${inventoryItem.unit}`, 14, 42);
  doc.text(`Current Stock: ${parseFloat(inventoryItem.currentStock).toFixed(2)} ${inventoryItem.unit}`, 14, 48);
  doc.text(`Average Rate: ${formatCurrency(inventoryItem.averageRate)}`, 14, 54);
  doc.text(`Stock Value: ${formatCurrency(inventoryItem.stockValue)}`, 14, 60);
  
  // Prepare table data
  const tableData = transactions.map(txn => [
    formatDate(txn.date),
    txn.type,
    txn.invoiceNumber || 'N/A',
    `${parseFloat(txn.quantity).toFixed(2)} ${inventoryItem.unit}`,
    formatCurrency(txn.rate),
    formatCurrency(txn.amount),
    txn.paymentMode
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 68,
    head: [['Date', 'Type', 'Invoice', 'Quantity', 'Rate', 'Amount', 'Payment']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
  });
  
  // Save
  doc.save(`inventory-${inventoryItem.cropName.replace(/\s+/g, '-')}.pdf`);
};

// Export Inventory to Excel
export const exportInventoryToExcel = (inventoryItem: any, transactions: any[]) => {
  const data = [
    ['Inventory Report'],
    [],
    ['Crop:', inventoryItem.cropName],
    ['Variety:', inventoryItem.variety || 'N/A'],
    ['Opening Stock:', `${parseFloat(inventoryItem.openingStock).toFixed(2)} ${inventoryItem.unit}`],
    ['Current Stock:', `${parseFloat(inventoryItem.currentStock).toFixed(2)} ${inventoryItem.unit}`],
    ['Average Rate:', formatCurrency(inventoryItem.averageRate)],
    ['Stock Value:', formatCurrency(inventoryItem.stockValue)],
    [],
    ['Date', 'Type', 'Invoice', 'Quantity', 'Rate', 'Amount', 'Payment Mode'],
    ...transactions.map(txn => [
      formatDate(txn.date),
      txn.type,
      txn.invoiceNumber || 'N/A',
      `${parseFloat(txn.quantity).toFixed(2)} ${inventoryItem.unit}`,
      formatCurrency(txn.rate),
      formatCurrency(txn.amount),
      txn.paymentMode
    ])
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, `inventory-${inventoryItem.cropName.replace(/\s+/g, '-')}.xlsx`);
};
