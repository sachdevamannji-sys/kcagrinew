import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { exportInventoryToPDF, exportInventoryToExcel } from '@/lib/exportUtils';

interface InventoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: any;
}

export default function InventoryPreviewModal({ isOpen, onClose, inventoryItem }: InventoryPreviewModalProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions', { cropId: inventoryItem?.cropId }],
    queryFn: () => transactionsApi.getAll({ cropId: inventoryItem.cropId }),
    enabled: !!inventoryItem?.cropId && isOpen
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatQuantity = (quantity: string | number, unit: string) => {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    return `${num.toFixed(2)} ${unit}`;
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'sale': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToPDF = () => {
    if (!inventoryItem || !transactions) return;
    exportInventoryToPDF(inventoryItem, transactions);
  };

  const exportToExcel = () => {
    if (!inventoryItem || !transactions) return;
    exportInventoryToExcel(inventoryItem, transactions);
  };

  if (!inventoryItem) return null;

  // Calculate total purchases and sales
  const purchases = transactions?.filter((t: any) => t.type === 'purchase') || [];
  const sales = transactions?.filter((t: any) => t.type === 'sale') || [];
  
  const totalPurchaseQuantity = purchases.reduce((sum: number, t: any) => sum + parseFloat(t.quantity || 0), 0);
  const totalSaleQuantity = sales.reduce((sum: number, t: any) => sum + parseFloat(t.quantity || 0), 0);
  const totalPurchaseAmount = purchases.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
  const totalSaleAmount = sales.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="inventory-preview-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{inventoryItem.cropName} {inventoryItem.variety && `- ${inventoryItem.variety}`}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                data-testid="button-export-inventory-pdf"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                data-testid="button-export-inventory-excel"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Inventory details and transaction history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Opening Stock</p>
                  <p className="text-lg font-bold">
                    {formatQuantity(inventoryItem.openingStock, inventoryItem.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-lg font-bold">
                    {formatQuantity(inventoryItem.currentStock, inventoryItem.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rate</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(inventoryItem.averageRate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(inventoryItem.stockValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatQuantity(totalPurchaseQuantity, inventoryItem.unit)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalPurchaseAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatQuantity(totalSaleQuantity, inventoryItem.unit)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalSaleAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Count</p>
                  <p className="text-lg font-bold">{purchases.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sale Count</p>
                  <p className="text-lg font-bold">{sales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History (Credit/Debit Entries)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading transactions...
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id} data-testid={`inventory-transaction-${transaction.id}`}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            <Badge className={getTransactionTypeColor(transaction.type)} variant="secondary">
                              {transaction.type === 'purchase' ? 'Purchase (Debit)' : 'Sale (Credit)'}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.invoiceNumber || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            {formatQuantity(transaction.quantity, inventoryItem.unit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(transaction.rate)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'purchase' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="capitalize">{transaction.paymentMode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-close-inventory-preview"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
