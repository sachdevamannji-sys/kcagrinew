import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, partiesApi, cropsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import TransactionModal from '@/components/modals/transaction-modal';
import SalePreviewModal from '@/components/modals/sale-preview-modal';
import { DollarSign, Package, Wallet, ShoppingCart, Search, Download, Plus, FileSpreadsheet, FileText, Eye } from 'lucide-react';
import { exportData, formatCurrencyForExport, formatDateForExport } from '@/lib/export';

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [previewSale, setPreviewSale] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [partyFilter, setPartyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/transactions', { type: 'sale' }],
    queryFn: () => transactionsApi.getAll({ type: 'sale' }),
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
        description: 'Sale deleted successfully. Inventory updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete sale.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handlePreview = (sale: any) => {
    setPreviewSale(sale);
    setIsPreviewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale? This will also update the party ledger.')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!filteredSales || filteredSales.length === 0) {
      toast({
        title: 'No Data',
        description: 'No sales records to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportSales = filteredSales.map((sale: any) => ({
      date: formatDateForExport(sale.date),
      party: getPartyName(sale.partyId),
      crop: getCropName(sale.cropId),
      quantity: `${parseFloat(sale.quantity || '0').toFixed(2)} Qt`,
      rate: formatCurrencyForExport(sale.rate || 0),
      amount: formatCurrencyForExport(sale.amount || 0),
      paymentStatus: sale.paymentStatus || 'pending',
      quality: sale.quality || '-'
    }));

    exportData({
      filename: `sales_report_${new Date().toISOString().split('T')[0]}`,
      title: 'Sales Report',
      columns: [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Party', key: 'party', width: 20 },
        { header: 'Crop', key: 'crop', width: 15 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Rate', key: 'rate', width: 12 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Payment Status', key: 'paymentStatus', width: 15 },
        { header: 'Quality', key: 'quality', width: 10 }
      ],
      data: exportSales,
      format
    });

    toast({
      title: 'Export Successful',
      description: `Sales report exported as ${format.toUpperCase()}.`,
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate summary metrics
  const totalSales = sales?.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.amount || '0'), 0) || 0;
  
  const totalQuantity = sales?.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.quantity || '0'), 0) || 0;
  
  const pendingPayments = sales?.filter((sale: any) => 
    sale.paymentStatus === 'pending').length || 0;
  
  const completedSales = sales?.filter((sale: any) => 
    sale.paymentStatus === 'completed').length || 0;

  // Filter sales based on search and filters
  const filteredSales = sales?.filter((sale: any) => {
    const matchesSearch = searchQuery === '' || 
      getPartyName(sale.partyId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCropName(sale.cropId).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesParty = partyFilter === 'all' || sale.partyId === partyFilter;
    const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;
    
    return matchesSearch && matchesParty && matchesStatus;
  }) || [];

  // Pagination calculation
  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  // Reset to page 1 when filtered data changes
  useEffect(() => {
    console.log(paginatedSales)
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
   
  }, [filteredSales.length]);

  if (isLoading) {
    return (
      <div>
        <Header title="Sales Management" subtitle="Manage sales to traders and exporters" />
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Sales Management" subtitle="Manage sales to traders and exporters" />
      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-total-sales">
                  {formatCurrency(totalSales)}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time sales</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-total-quantity">
                  {totalQuantity.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Quintals sold</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-pending-payments">
                  {pendingPayments}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Sales</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-completed-sales">
                  {completedSales}
                </p>
                <p className="text-xs text-gray-500 mt-1">Paid transactions</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Records Section */}
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sales Records</h3>
                <p className="text-sm text-gray-600 mt-1">Track all sales transactions</p>
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
                      <FileText className="w-4 h-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-add-sale"
                >
                  <Plus className="w-4 h-4" />
                  Add Sale
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by party or crop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger className="w-48" data-testid="select-party-filter">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sales Table */}
          {filteredSales.length === 0 ? (
            <div className="text-center py-12" data-testid="sales-empty-state">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales records found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || partyFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Click "Add Sale" to create your first sale'}
              </p>
              {!searchQuery && partyFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setIsModalOpen(true)}>Add Sale</Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Party</TableHead>
                    <TableHead className="font-semibold">Crop</TableHead>
                    <TableHead className="font-semibold">Quantity</TableHead>
                    <TableHead className="font-semibold">Rate</TableHead>
                    <TableHead className="font-semibold">Total Amount</TableHead>
                    <TableHead className="font-semibold">Payment Status</TableHead>
                    <TableHead className="font-semibold">Quality Grade</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale: any) => (
                    <TableRow 
                      key={sale.id} 
                      data-testid={`sale-row-${sale.id}`}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="text-gray-900">
                        {formatDate(sale.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {getPartyName(sale.partyId).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getPartyName(sale.partyId)}</p>
                            <p className="text-xs text-gray-500">
                              {parties?.find((p: any) => p.id === sale.partyId)?.type || 'Trader'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-900">{getCropName(sale.cropId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {parseFloat(sale.quantity || '0').toFixed(0)} quintal
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {formatCurrency(sale.rate || 0)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatCurrency(sale.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sale.paymentStatus === 'completed' ? 'default' : 'secondary'}
                          className={
                            sale.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                          data-testid={`badge-status-${sale.id}`}
                        >
                          {sale.paymentStatus || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {sale.quality || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(sale);
                            }}
                            data-testid={`button-preview-sale-${sale.id}`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(sale);
                            }}
                            data-testid={`button-edit-sale-${sale.id}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sale.id);
                            }}
                            data-testid={`button-delete-sale-${sale.id}`}
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
            </div>
          )}
        </Card>

        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          transaction={editingTransaction}
          type="sale"
          parties={parties || []}
          crops={crops || []}
        />

        <SalePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewSale(null);
          }}
          sale={previewSale}
          partyName={previewSale ? getPartyName(previewSale.partyId) : undefined}
          cropName={previewSale ? getCropName(previewSale.cropId) : undefined}
          cropUnit={previewSale ? crops?.find((c: any) => c.id === previewSale.cropId)?.unit : undefined}
        />
      </div>
    </div>
  );
}
