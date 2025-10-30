import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partiesApi, ledgerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import { TrendingUp, TrendingDown, Wallet, Users, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportData, formatCurrencyForExport, formatDateForExport } from '@/lib/export';

export default function LedgerPage() {
  const [selectedPartyId, setSelectedPartyId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: parties, isLoading: partiesLoading,refetch: refetchParties } = useQuery({
    queryKey: ['/api/parties/with-balance'],
    queryFn: partiesApi.getWithBalance,
  });

  const { data: ledgerEntries, isLoading: ledgerLoading,refetch: refetchLedger } = useQuery({
    queryKey: ['/api/ledger', selectedPartyId],
    queryFn: () => selectedPartyId === 'all' ? ledgerApi.getAllLedgerEntries() : ledgerApi.getPartyLedger(selectedPartyId),
    // enabled: !!selectedPartyId, commented for referesh issue
  });
  useEffect(() => {
    refetchParties();
    refetchLedger();
  }, []);
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

  // Calculate summary metrics from all parties
  // Debit = Money owed to us (receivables - negative balances in absolute terms)
  const totalDebit = parties?.reduce((sum: number, party: any) => {
    const balance = parseFloat(party.totalBalance || '0');
    return balance < 0 ? sum + Math.abs(balance) : sum;
  }, 0) || 0;

  // Credit = Money we owe (payables - positive balances)
  const totalCredit = parties?.reduce((sum: number, party: any) => {
    const balance = parseFloat(party.totalBalance || '0');
    return balance > 0 ? sum + balance : sum;
  }, 0) || 0;

  const netBalance = totalDebit - totalCredit;

  const activeParties = parties?.filter((party: any) => {
    const balance = parseFloat(party.totalBalance || '0');
    return balance !== 0;
  }).length || 0;

  // Separate parties into receivables and payables
  const receivables = parties?.filter((party: any) => {
    const balance = parseFloat(party.totalBalance || '0');
    return balance < 0; // Negative balance means they owe us
  }) || [];

  const payables = parties?.filter((party: any) => {
    const balance = parseFloat(party.totalBalance || '0');
    return balance > 0; // Positive balance means we owe them
  }) || [];

  const getPartyName = (partyId: string) => {
    return parties?.find((party: any) => party.id === partyId)?.name || 'Unknown Party';
  };

  const getTransactionType = (description: string) => {
    if (description.includes('Purchase')) return 'Purchase';
    if (description.includes('Sale')) return 'Sale';
    if (description.includes('Expense')) return 'Expense';
    if (description.includes('Payment')) return 'Payment';
    if (description.includes('Receipt')) return 'Receipt';
    return 'Other';
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!ledgerEntries || ledgerEntries.length === 0) {
      toast({
        title: 'No Data',
        description: 'No ledger entries to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportLedger = ledgerEntries.map((entry: any) => ({
      date: formatDateForExport(entry.date),
      party: getPartyName(entry.partyId),
      description: entry.description || '-',
      debit: entry.debit ? formatCurrencyForExport(entry.debit) : '-',
      credit: entry.credit ? formatCurrencyForExport(entry.credit) : '-',
      balance: formatCurrencyForExport(entry.balance || 0)
    }));

    exportData({
      filename: `ledger_report_${new Date().toISOString().split('T')[0]}`,
      title: selectedPartyId === 'all' ? 'Complete Ledger Report' : `Ledger Report - ${getPartyName(selectedPartyId)}`,
      columns: [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Party', key: 'party', width: 20 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Debit', key: 'debit', width: 12 },
        { header: 'Credit', key: 'credit', width: 12 },
        { header: 'Balance', key: 'balance', width: 12 }
      ],
      data: exportLedger,
      format
    });

    toast({
      title: 'Export Successful',
      description: `Ledger report exported as ${format.toUpperCase()}.`,
    });
  };

  // Pagination calculation
  const totalItems = ledgerEntries?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = ledgerEntries?.slice(startIndex, endIndex) || [];

  // Reset to page 1 when filtered data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [ledgerEntries?.length, selectedPartyId]);

  if (partiesLoading) {
    return (
      <div>
        <Header title="Ledger Management" subtitle="Track party balances and payments" />
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Ledger Management" subtitle="Track party balances and payments" />
      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Debit</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-total-debit">
                  {formatCurrency(totalDebit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Money owed to us</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Credit</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-total-credit">
                  {formatCurrency(totalCredit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Money we owe</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance < 0 ? 'text-red-900' : 'text-gray-900'}`} data-testid="metric-net-balance">
                  {formatCurrency(Math.abs(netBalance))}
                </p>
                <p className="text-xs text-gray-500 mt-1">{netBalance < 0 ? 'Net payable' : 'Net receivable'}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Parties</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="metric-active-parties">
                  {activeParties}
                </p>
                <p className="text-xs text-gray-500 mt-1">With outstanding balances</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Receivables and Payables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Receivables */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Receivables</h3>
              <p className="text-sm text-gray-600">Parties who owe us money</p>
            </div>
            {receivables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No receivables at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivables.map((party: any) => (
                  <div 
                    key={party.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    data-testid={`receivable-${party.id}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{party.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{party.type}</p>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(Math.abs(parseFloat(party.totalBalance || '0')))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payables */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Payables</h3>
              <p className="text-sm text-gray-600">Parties we owe money to</p>
            </div>
            {payables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payables at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payables.map((party: any) => (
                  <div 
                    key={party.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    data-testid={`payable-${party.id}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{party.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{party.type}</p>
                    </div>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(parseFloat(party.totalBalance || '0'))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Ledger Entries Section */}
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ledger Entries</h3>
                <p className="text-sm text-gray-600 mt-1">All financial transactions and balances</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                  <SelectTrigger className="w-48" data-testid="select-party-filter">
                    <SelectValue placeholder="Filter by Party" />
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
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          {ledgerLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto"></div>
            </div>
          ) : !ledgerEntries || ledgerEntries.length === 0 ? (
            <div className="text-center py-12" data-testid="ledger-empty-state">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ledger entries found</h3>
              <p className="text-gray-600">
                {selectedPartyId === 'all' 
                  ? 'No transactions recorded yet' 
                  : 'No transactions for this party'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Party</TableHead>
                    <TableHead className="font-semibold">Transaction Type</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Debit</TableHead>
                    <TableHead className="font-semibold text-right">Credit</TableHead>
                    <TableHead className="font-semibold text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry: any) => (
                    <TableRow 
                      key={entry.id} 
                      data-testid={`ledger-entry-${entry.id}`}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="text-gray-900">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        {getPartyName(entry.partyId)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {getTransactionType(entry.description)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 max-w-xs truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {parseFloat(entry.debit || '0') > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {parseFloat(entry.credit || '0') > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        parseFloat(entry.balance || '0') > 0 
                          ? 'text-red-600' 
                          : parseFloat(entry.balance || '0') < 0 
                            ? 'text-green-600' 
                            : 'text-gray-900'
                      }`}>
                        {formatCurrency(Math.abs(parseFloat(entry.balance || '0')))}
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
      </div>
    </div>
  );
}
