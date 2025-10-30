import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import InventoryPreviewModal from '@/components/modals/inventory-preview-modal';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportData, formatCurrencyForExport } from '@/lib/export';

export default function InventoryPage() {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: inventoryApi.getAll,
  });

  const handleViewInventory = (item: any) => {
    setSelectedItem(item);
    setIsPreviewModalOpen(true);
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!inventory || inventory.length === 0) {
      toast({
        title: 'No Data',
        description: 'No inventory records to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportInventory = inventory.map((item: any) => ({
      crop: item.cropName || '-',
      variety: item.variety || '-',
      currentStock: `${parseFloat(item.currentStock || '0').toFixed(2)} Qt`,
      minStockLevel: `${parseFloat(item.minStockLevel || '0').toFixed(2)} Qt`,
      stockValue: formatCurrencyForExport(item.stockValue || 0),
      status: getStockStatus(item.currentStock, item.minStockLevel).label
    }));

    exportData({
      filename: `inventory_report_${new Date().toISOString().split('T')[0]}`,
      title: 'Inventory Report',
      columns: [
        { header: 'Crop', key: 'crop', width: 20 },
        { header: 'Variety', key: 'variety', width: 15 },
        { header: 'Current Stock', key: 'currentStock', width: 15 },
        { header: 'Min Stock Level', key: 'minStockLevel', width: 15 },
        { header: 'Stock Value', key: 'stockValue', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ],
      data: exportInventory,
      format
    });

    toast({
      title: 'Export Successful',
      description: `Inventory report exported as ${format.toUpperCase()}.`,
    });
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

  const getStockStatus = (currentStock: string, minStock: string) => {
    const current = parseFloat(currentStock || '0');
    const minimum = parseFloat(minStock || '0');
    
    if (current === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (current <= minimum) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  // Calculate totals
  const totalValue = inventory?.reduce((sum: number, item: any) => 
    sum + parseFloat(item.stockValue || '0'), 0) || 0;
  const totalStock = inventory?.reduce((sum: number, item: any) => 
    sum + parseFloat(item.currentStock || '0'), 0) || 0;
  const lowStockItems = inventory?.filter((item: any) => {
    const current = parseFloat(item.currentStock || '0');
    const minimum = parseFloat(item.minStockLevel || '0');
    return current <= minimum && current > 0;
  }).length || 0;
  const outOfStockItems = inventory?.filter((item: any) => 
    parseFloat(item.currentStock || '0') === 0).length || 0;

  // Pagination calculation
  const totalItems = inventory?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventory = inventory?.slice(startIndex, endIndex) || [];

  // Reset to page 1 when filtered data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [inventory?.length]);

  if (isLoading) {
    return (
      <div>
        <Header title="Inventory Management" subtitle="Real-time stock tracking and valuation" />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Inventory Management" subtitle="Real-time stock tracking and valuation" />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Inventory Report</h3>
            <p className="text-sm text-muted-foreground">
              Real-time stock tracking by crop
            </p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-export-inventory">
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
            <Button variant="outline" data-testid="button-filter-inventory">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filter
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-inventory-value">
                    {formatCurrency(totalValue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Across all crops</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Crops</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-crops">
                    {inventory?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Active varieties</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9l-9-9-9 9" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold text-amber-600" data-testid="low-stock-items">
                    {lowStockItems}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="out-of-stock-items">
                    {outOfStockItems}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Needs immediate attention</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            {inventory?.length === 0 ? (
              <div className="text-center py-12" data-testid="inventory-empty-state">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No inventory data found</h3>
                <p className="text-muted-foreground mb-4">
                  Inventory will be populated automatically as you add crops and transactions.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crop Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Opening Stock</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Avg. Rate</TableHead>
                      <TableHead>Stock Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInventory?.map((item: any) => {
                      const status = getStockStatus(item.currentStock, item.minStockLevel);
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/50" data-testid={`inventory-row-${item.id}`}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9l-9-9-9 9" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">{item.cropName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.variety ? `Variety: ${item.variety}` : 'No variety'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.category || 'Uncategorized'}</TableCell>
                          <TableCell>
                            {parseFloat(item.openingStock || '0').toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {parseFloat(item.currentStock || '0').toFixed(2)}
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            {formatCurrency(item.averageRate || 0)}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatCurrency(item.stockValue || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInventory(item)}
                              data-testid={`button-view-inventory-${item.id}`}
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Totals */}
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-end space-x-8">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Stock</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="total-stock-summary">
                        {totalStock.toFixed(2)} Qt
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Value</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="total-value-summary">
                        {formatCurrency(totalValue)}
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

        <InventoryPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedItem(null);
          }}
          inventoryItem={selectedItem}
        />
      </div>
    </div>
  );
}
