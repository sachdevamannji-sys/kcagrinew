import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, partiesApi, cropsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import { useState, useEffect } from 'react';

export default function TrashPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deletedTransactions, isLoading, refetch: refetchDeleted } = useQuery({
    queryKey: ['/api/transactions/deleted'],
    queryFn: transactionsApi.getDeleted,
  });
  
  const { data: parties, refetch: refetchParties } = useQuery({
    queryKey: ['/api/parties'],
    queryFn: partiesApi.getAll,
  });
  
  const { data: crops, refetch: refetchCrops } = useQuery({
    queryKey: ['/api/crops'],
    queryFn: cropsApi.getAll,
  });
  
  // 🔄 Force fetch latest data every time the component mounts
  useEffect(() => {
    refetchDeleted();
    refetchParties();
    refetchCrops();
  }, []);
  

  const restoreTransactionMutation = useMutation({
    mutationFn: transactionsApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/deleted'] });
      toast({
        title: 'Success',
        description: 'Transaction restored successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restore transaction.',
        variant: 'destructive',
      });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: transactionsApi.permanentDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/deleted'] });
      toast({
        title: 'Success',
        description: 'Transaction permanently deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to permanently delete transaction.',
        variant: 'destructive',
      });
    },
  });

  const handleRestore = async (id: string) => {
    if (window.confirm('Are you sure you want to restore this transaction?')) {
      restoreTransactionMutation.mutate(id);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this transaction? This action cannot be undone!')) {
      permanentDeleteMutation.mutate(id);
    }
  };

  const getPartyName = (partyId: string) => {
    if (!partyId) return 'N/A';
    return parties?.find((party: any) => party.id === partyId)?.name || 'Unknown Party';
  };

  const getCropName = (cropId: string) => {
    if (!cropId) return 'N/A';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'sale': return 'bg-blue-100 text-blue-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Trash" subtitle="Deleted transactions that can be restored" />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Trash" subtitle="Deleted transactions that can be restored or permanently deleted" />
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Trash</CardTitle>
            <CardDescription>
              {deletedTransactions?.length || 0} deleted transaction(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!deletedTransactions || deletedTransactions.length === 0 ? (
              <div className="text-center py-12" data-testid="trash-empty">
                <svg
                  className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">Trash is empty</h3>
                <p className="text-muted-foreground">
                  No deleted transactions to display
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id} data-testid={`trash-row-${transaction.id}`}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)} variant="secondary">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.invoiceNumber || 'N/A'}</TableCell>
                      <TableCell>{getPartyName(transaction.partyId)}</TableCell>
                      <TableCell>{getCropName(transaction.cropId)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.paymentMode || 'cash'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(transaction.id)}
                            data-testid={`button-restore-${transaction.id}`}
                            className="text-green-600 hover:text-green-700"
                            title="Restore transaction"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePermanentDelete(transaction.id)}
                            data-testid={`button-permanent-delete-${transaction.id}`}
                            className="text-red-600 hover:text-red-700"
                            title="Permanently delete transaction"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
