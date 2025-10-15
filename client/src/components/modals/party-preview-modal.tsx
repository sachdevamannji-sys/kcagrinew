import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportPartyLedgerToPDF, exportPartyLedgerToExcel } from '@/lib/exportUtils';

interface PartyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: any;
}

export default function PartyPreviewModal({ isOpen, onClose, party }: PartyPreviewModalProps) {
  const { data: ledgerEntries, isLoading } = useQuery({
    queryKey: ['/api/ledger', party?.id],
    queryFn: () => ledgerApi.getPartyLedger(party.id),
    enabled: !!party?.id && isOpen
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

  const currentBalance = ledgerEntries && ledgerEntries.length > 0 
    ? parseFloat(ledgerEntries[0].balance)
    : parseFloat(party?.openingBalance || '0');

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const exportToPDF = () => {
    if (!party || !ledgerEntries) return;
    exportPartyLedgerToPDF(party, ledgerEntries);
  };

  const exportToExcel = () => {
    if (!party || !ledgerEntries) return;
    exportPartyLedgerToExcel(party, ledgerEntries);
  };

  if (!party) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="party-preview-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{party.name}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                data-testid="button-export-pdf"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                data-testid="button-export-excel"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Party details and transaction history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Party Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Party Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline" className="mt-1">
                    {party.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{party.phone}</p>
                </div>
                {party.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{party.email}</p>
                  </div>
                )}
                {party.gstNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">GST Number</p>
                    <p className="font-medium">{party.gstNumber}</p>
                  </div>
                )}
                {party.aadharCard && (
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhar Card</p>
                    <p className="font-medium">{party.aadharCard}</p>
                  </div>
                )}
                {party.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{party.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Balance Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Opening Balance</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(party.openingBalance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className={`text-xl font-bold ${getBalanceColor(currentBalance)}`}>
                    {formatCurrency(currentBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentBalance > 0 ? 'You will receive' : currentBalance < 0 ? 'You will pay' : 'Settled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading transactions...
                </div>
              ) : !ledgerEntries || ledgerEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerEntries.map((entry: any) => (
                        <TableRow key={entry.id} data-testid={`ledger-entry-${entry.id}`}>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right">
                            {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${getBalanceColor(parseFloat(entry.balance))}`}>
                            {formatCurrency(entry.balance)}
                          </TableCell>
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
            data-testid="button-close-preview"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
