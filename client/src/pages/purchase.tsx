import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, partiesApi, cropsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import TransactionModal from '@/components/modals/transaction-modal';
import PurchasePreviewModal from '@/components/modals/purchase-preview-modal';
import { Download, FileSpreadsheet, FileText, Eye } from 'lucide-react';
import { exportData, formatCurrencyForExport, formatDateForExport } from '@/lib/export';
import { useMemo } from "react";
export default function PurchasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [previewPurchase, setPreviewPurchase] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [partyFilter, setPartyFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['/api/transactions', { type: 'purchase' }],
    queryFn: () => transactionsApi.getAll({ type: 'purchase' }),
  });

  const { data: parties } = useQuery({
    queryKey: ['/api/parties'],
    queryFn: partiesApi.getAll,
  });

  const { data: crops } = useQuery({
    queryKey: ['/api/crops'],
    queryFn: cropsApi.getAll,
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: 'Success',
        description: 'Purchase deleted successfully. Inventory updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete purchase.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handlePreview = (purchase: any) => {
    setPreviewPurchase(purchase);
    setIsPreviewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase? This will also update the party ledger.')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!purchases || purchases.length === 0) {
      toast({
        title: 'No Data',
        description: 'No purchase records to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportPurchases = purchases.map((purchase: any) => ({
      date: formatDateForExport(purchase.date),
      invoiceNo: purchase.invoiceNumber || '-',
      party: getPartyName(purchase.partyId),
      crop: getCropName(purchase.cropId),
      quantity: `${parseFloat(purchase.quantity || '0').toFixed(2)} Qt`,
      rate: formatCurrencyForExport(purchase.rate || 0),
      amount: formatCurrencyForExport(purchase.amount || 0),
      paymentMode: purchase.paymentMode || 'cash'
    }));

    exportData({
      filename: `purchase_report_${new Date().toISOString().split('T')[0]}`,
      title: 'Purchase Report',
      columns: [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Invoice No', key: 'invoiceNo', width: 15 },
        { header: 'Party', key: 'party', width: 20 },
        { header: 'Crop', key: 'crop', width: 15 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Rate', key: 'rate', width: 12 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Payment Mode', key: 'paymentMode', width: 15 }
      ],
      data: exportPurchases,
      format
    });

    toast({
      title: 'Export Successful',
      description: `Purchase report exported as ${format.toUpperCase()}.`,
    });
  };

  const getPartyName = (partyId: string) => {
    return parties?.find((party: any) => party.id === partyId)?.name || 'Unknown Party';
  };

  const getCropName = (cropId: string) => {
    return crops?.find((crop: any) => crop.id === cropId)?.name || 'Unknown Crop';
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case 'cash': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'cheque': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'online': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'credit': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };
// Client-side filter function
const getFilteredPurchases = () => {
  if (!purchases) return [];

  return purchases.filter((p: any) => {
    const purchaseDate = new Date(p.date);
    const fromOk = !dateFrom || purchaseDate >= new Date(dateFrom);
    const toOk = !dateTo || purchaseDate <= new Date(dateTo);
    const partyOk = !partyFilter || partyFilter === 'all' || p.partyId === partyFilter;
    const cropOk = !cropFilter || cropFilter === 'all' || p.cropId === cropFilter;
    return fromOk && toOk && partyOk && cropOk;
  });
};

  // Calculate totals
  // const totalQuantity = purchases?.reduce((sum: number, purchase: any) => 
  //   sum + parseFloat(purchase.quantity || '0'), 0) || 0;
  // const totalAmount = purchases?.reduce((sum: number, purchase: any) => 
  //   sum + parseFloat(purchase.amount || '0'), 0) || 0;

  // Pagination calculation
  // const totalItems = purchases?.length || 0;
  // const totalPages = Math.ceil(totalItems / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const paginatedPurchases = purchases?.slice(startIndex, endIndex) || [];
// Apply filters first
const filteredPurchases = useMemo(() => {
  if (!purchases) return [];
  return purchases.filter((p: any) => {
    const purchaseDate = new Date(p.date);
    const fromOk = !dateFrom || purchaseDate >= new Date(dateFrom);
    const toOk = !dateTo || purchaseDate <= new Date(dateTo);
    const partyOk = !partyFilter || partyFilter === 'all' || p.partyId === partyFilter;
    const cropOk = !cropFilter || cropFilter === 'all' || p.cropId === cropFilter;
    return fromOk && toOk && partyOk && cropOk;
  });
}, [purchases, dateFrom, dateTo, partyFilter, cropFilter]);

// Calculate totals based on filtered data
const totalQuantity = filteredPurchases.reduce(
  (sum: number, purchase: any) => sum + parseFloat(purchase.quantity || '0'),
  0
);
const totalAmount = filteredPurchases.reduce(
  (sum: number, purchase: any) => sum + parseFloat(purchase.amount || '0'),
  0
);

// Pagination
const totalItems = filteredPurchases.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

// Reset page when filters change
useEffect(() => {
  setCurrentPage(1);
}, [dateFrom, dateTo, partyFilter, cropFilter]);

  if (isLoading) {
    return (
      <div>
        <Header title="Purchase Management" subtitle="Record and manage crop purchases" />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Purchase Management" subtitle="Record and manage crop purchases" />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Purchase Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Record your crop purchases
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-export">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')} data-testid="export-excel">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} data-testid="export-pdf">
                  <FileText className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => setIsModalOpen(true)}
              data-testid="button-add-purchase"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Purchase
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Party</label>
                <Select value={partyFilter} onValueChange={setPartyFilter}>
                  <SelectTrigger data-testid="select-party-filter">
                    <SelectValue placeholder="All Parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    {parties?.map((party: any) => (
                      <SelectItem key={party.id} value={party.id}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Crop</label>
                <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger data-testid="select-crop-filter">
                    <SelectValue placeholder="All Crops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crops</SelectItem>
                    {crops?.map((crop: any) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {purchases?.length === 0 ? (
              <div className="text-center py-12" data-testid="purchases-empty-state">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No purchase records found</h3>
                <p className="text-muted-foreground mb-4">
                  Click "New Purchase" to add an entry.
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  New Purchase
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPurchases?.map((purchase: any) => (
                      <TableRow key={purchase.id} data-testid={`purchase-row-${purchase.id}`}>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
                        <TableCell className="font-medium">
                          {purchase.invoiceNumber || 'N/A'}
                        </TableCell>
                        <TableCell>{getPartyName(purchase.partyId)}</TableCell>
                        <TableCell>{getCropName(purchase.cropId)}</TableCell>
                        <TableCell>
                          {parseFloat(purchase.quantity || '0').toFixed(2)} Qt
                        </TableCell>
                        <TableCell>
                          {formatCurrency(purchase.rate || 0)}/Qt
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(purchase.amount || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentModeColor(purchase.paymentMode || 'cash')} variant="secondary">
                            {purchase.paymentMode || 'cash'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(purchase)}
                              data-testid={`button-preview-purchase-${purchase.id}`}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(purchase)}
                              data-testid={`button-edit-purchase-${purchase.id}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(purchase.id)}
                              data-testid={`button-delete-purchase-${purchase.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Summary */}
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-end space-x-8">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Quantity</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="total-quantity">
                        {totalQuantity.toFixed(2)} Qt
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="total-amount">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} items
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          transaction={editingTransaction}
          type="purchase"
          parties={parties || []}
          crops={crops || []}
        />

        <PurchasePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewPurchase(null);
          }}
          purchase={previewPurchase}
          partyName={previewPurchase ? getPartyName(previewPurchase.partyId) : undefined}
          cropName={previewPurchase ? getCropName(previewPurchase.cropId) : undefined}
          cropUnit={previewPurchase ? crops?.find((c: any) => c.id === previewPurchase.cropId)?.unit : undefined}
        />
      </div>
    </div>
  );
}
