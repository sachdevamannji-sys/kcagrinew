import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashRegisterApi, partiesApi } from '@/lib/api';
import { formatDateTimeIST } from '@/lib/timezone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import CashEntryModal from '@/components/modals/cash-entry-modal';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportData, formatCurrencyForExport, formatDateForExport } from '@/lib/export';
import { useMemo } from "react";

export default function RokarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [editEntry, setEditEntry] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cashEntries, isLoading } = useQuery({
    queryKey: ['/api/cash-register'],
    queryFn: cashRegisterApi.getAll,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['/api/cash-register/balance'],
    queryFn: cashRegisterApi.getBalance,
  });

  const { data: parties } = useQuery({
    queryKey: ['/api/parties'],
    queryFn: partiesApi.getAll,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return formatDateTimeIST(dateString);
  };

  // Calculate daily totals
  const currentDate = new Date().toDateString();
  const todayEntries = cashEntries?.filter((entry: any) => 
    new Date(entry.date).toDateString() === currentDate
  ) || [];

  const todayCashIn = todayEntries
    .filter((entry: any) => entry.type === 'cash_in')
    .reduce((sum: number, entry: any) => sum + parseFloat(entry.amount), 0);

  const todayCashOut = todayEntries
    .filter((entry: any) => entry.type === 'cash_out')
    .reduce((sum: number, entry: any) => sum + parseFloat(entry.amount), 0);

  const currentBalance = balanceData?.balance || 0;
  const openingBalance = currentBalance - todayCashIn + todayCashOut;

  const handleAddCashEntry = (type: 'cash_in' | 'cash_out') => {
    setEditEntry(null);
    setEntryType(type);
    setIsModalOpen(true);
  };

  const handleEditCashEntry = (entry: any) => {
    setEditEntry(entry);
    setEntryType(entry.type);
    setIsModalOpen(true);
  };

  const getPartyName = (partyId: string) => {
    if (!partyId) return 'N/A';
    return parties?.find((party: any) => party.id === partyId)?.name || 'Unknown Party';
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!cashEntries || cashEntries.length === 0) {
      toast({
        title: 'No Data',
        description: 'No cash entries to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportCash = cashEntries.map((entry: any) => ({
      date: formatDateForExport(entry.date),
      type: entry.type === 'cash_in' ? 'Cash In' : 'Cash Out',
      description: entry.description || '-',
      party: entry.partyId ? getPartyName(entry.partyId) : 'N/A',
      amount: formatCurrencyForExport(entry.amount || 0),
      balance: formatCurrencyForExport(entry.balance || 0),
      reference: entry.reference || '-'
    }));

    exportData({
      filename: `cash_register_report_${new Date().toISOString().split('T')[0]}`,
      title: 'Cash Register Report',
      columns: [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Description', key: 'description', width: 25 },
        { header: 'Party', key: 'party', width: 20 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Balance', key: 'balance', width: 12 },
        { header: 'Reference', key: 'reference', width: 15 }
      ],
      data: exportCash,
      format
    });

    toast({
      title: 'Export Successful',
      description: `Cash register report exported as ${format.toUpperCase()}.`,
    });
  };

  // Pagination calculation
 // ✅ Client-side filtering
const filteredEntries = useMemo(() => {
  if (!cashEntries) return [];

  return cashEntries.filter((entry: any) => {
    const entryDate = new Date(entry.date);
    const dateOk = !dateFilter || new Date(dateFilter).toDateString() === entryDate.toDateString();
    const typeOk = !typeFilter || typeFilter === 'all' || entry.type === typeFilter;
    return dateOk && typeOk;
  });
}, [cashEntries, dateFilter, typeFilter]);

// ✅ Pagination (based on filtered data)
const totalItems = filteredEntries.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

// ✅ Reset to page 1 when filters change
useEffect(() => {
  setCurrentPage(1);
}, [dateFilter, typeFilter]);


  if (isLoading) {
    return (
      <div>
        <Header title="Rokar / Cash Management" subtitle="Daily cash register and balance tracking" />
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
      <Header title="Rokar / Cash Management" subtitle="Daily cash register and balance tracking" />
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">Rokar / Cash Management</h3>
          <p className="text-sm text-muted-foreground">
            Daily cash register and balance tracking
          </p>
        </div>

        {/* Cash Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opening Balance</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="opening-balance">
                    {formatCurrency(openingBalance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cash In (Today)</p>
                  <p className="text-2xl font-bold text-emerald-600" data-testid="cash-in-today">
                    {formatCurrency(todayCashIn)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cash Out (Today)</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="cash-out-today">
                    {formatCurrency(todayCashOut)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-primary" data-testid="current-balance">
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cash Register */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daily Cash Register</CardTitle>
                <CardDescription>Track all cash inflows and outflows</CardDescription>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAddCashEntry('cash_in')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-cash-in"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Cash In
                </Button>
                <Button
                  onClick={() => handleAddCashEntry('cash_out')}
                  variant="destructive"
                  data-testid="button-cash-out"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                  Cash Out
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  data-testid="input-date-filter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger data-testid="select-type-filter">
                    <SelectValue placeholder="All Transactions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="cash_in">Cash In</SelectItem>
                    <SelectItem value="cash_out">Cash Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2" data-testid="button-export">
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
              </div>
            </div>

            {cashEntries?.length === 0 ? (
              <div className="text-center py-12" data-testid="cash-register-empty">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No cash transactions recorded</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your cash flow by adding cash in/out entries.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => handleAddCashEntry('cash_in')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Add Cash In
                  </Button>
                  <Button
                    onClick={() => handleAddCashEntry('cash_out')}
                    variant="destructive"
                  >
                    Add Cash Out
                  </Button>
                </div>
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Party/Source</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries?.map((entry: any) => (
                    <TableRow key={entry.id} data-testid={`cash-entry-row-${entry.id}`}>
                      <TableCell className="text-sm">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entry.type === 'cash_in' ? 'default' : 'destructive'}
                          className={entry.type === 'cash_in' ? 'bg-emerald-600' : ''}
                        >
                          {entry.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-sm">
                        {getPartyName(entry.partyId)}
                      </TableCell>
                      <TableCell className={`font-medium ${
                        entry.type === 'cash_in' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {entry.type === 'cash_in' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCashEntry(entry)}
                          data-testid={`button-edit-cash-entry-${entry.id}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
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
              </>
            )}
          </CardContent>
        </Card>

        <CashEntryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditEntry(null);
          }}
          entryType={entryType}
          parties={parties || []}
          editEntry={editEntry}
        />
      </div>
    </div>
  );
}
