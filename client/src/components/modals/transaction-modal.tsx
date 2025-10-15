import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { transactionsApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const baseTransactionFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  invoiceNumber: z.string().optional(),
  partyId: z.string().optional(),
  cropId: z.string().optional(),
  quantity: z.string().optional(),
  rate: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  paymentMode: z.enum(['cash', 'credit', 'bank_transfer', 'cheque']).default('cash'),
  paymentStatus: z.enum(['pending', 'completed']).default('pending').optional(),
  quality: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(), // for expenses
  expenseCategory: z.string().optional(), // for purchase/sale expense
  expenseAmount: z.string().optional() // for purchase/sale expense
});

const transactionFormSchema = baseTransactionFormSchema;

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  type: 'purchase' | 'sale' | 'expense';
  parties: any[];
  crops: any[];
}

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  type, 
  parties, 
  crops 
}: TransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dynamic schema based on transaction type
  const dynamicSchema = type === 'expense' 
    ? baseTransactionFormSchema
    : baseTransactionFormSchema.extend({
        partyId: z.string().min(1, 'Party is required'),
        cropId: z.string().min(1, 'Crop is required'),
        quantity: z.string().min(1, 'Quantity is required'),
        rate: z.string().min(1, 'Rate is required'),
      });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      partyId: '',
      cropId: '',
      quantity: '',
      rate: '',
      amount: '',
      paymentMode: 'cash',
      paymentStatus: 'pending',
      quality: '',
      notes: '',
      category: '',
      expenseCategory: '',
      expenseAmount: ''
    }
  });

  const quantity = form.watch('quantity');
  const rate = form.watch('rate');
  const expenseAmount = form.watch('expenseAmount');

  // Auto-calculate amount when quantity, rate, or expense changes
  useEffect(() => {
    if (quantity && rate && type !== 'expense') {
      const baseAmount = parseFloat(quantity) * parseFloat(rate);
      const expense = expenseAmount ? parseFloat(expenseAmount) : 0;
      const calculatedAmount = (baseAmount + expense).toFixed(2);
      form.setValue('amount', calculatedAmount);
    }
  }, [quantity, rate, expenseAmount, form, type]);

  const createTransactionMutation = useMutation({
    mutationFn: transactionsApi.create,
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to create ${type}.`,
        variant: 'destructive',
      });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: transactionsApi.create,
    onError: (error: any) => {
      toast({
        title: 'Warning',
        description: `Main transaction created but expense failed: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully.`,
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to update ${type}.`,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        date: transaction.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        invoiceNumber: transaction.invoiceNumber || '',
        partyId: transaction.partyId || '',
        cropId: transaction.cropId || '',
        quantity: transaction.quantity || '',
        rate: transaction.rate || '',
        amount: transaction.amount || '',
        paymentMode: transaction.paymentMode || 'cash',
        paymentStatus: transaction.paymentStatus || 'pending',
        quality: transaction.quality || '',
        notes: transaction.notes || '',
        category: transaction.category || '',
        expenseCategory: '',
        expenseAmount: ''
      });
    } else {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        partyId: '',
        cropId: '',
        quantity: '',
        rate: '',
        amount: '',
        paymentMode: 'cash',
        paymentStatus: 'pending',
        quality: '',
        notes: '',
        category: '',
        expenseCategory: '',
        expenseAmount: ''
      });
    }
  }, [transaction, form]);

  const onSubmit = async (data: TransactionFormData) => {
    // Add expense information to notes if expense is provided
    let notes = data.notes || '';
    if ((type === 'purchase' || type === 'sale') && data.expenseCategory && data.expenseAmount && parseFloat(data.expenseAmount) > 0) {
      const expenseNote = `[Expense: ${data.expenseCategory} - ₹${data.expenseAmount}]`;
      notes = notes ? `${notes}\n${expenseNote}` : expenseNote;
    }

    const formattedData = {
      type,
      date: new Date(data.date).toISOString(),
      invoiceNumber: data.invoiceNumber || null,
      partyId: data.partyId || null,
      cropId: type === 'expense' ? null : (data.cropId || null),
      quantity: type === 'expense' ? null : (data.quantity || null),
      rate: type === 'expense' ? null : (data.rate || null),
      amount: data.amount,
      paymentMode: data.paymentMode,
      paymentStatus: data.paymentStatus || 'pending',
      quality: data.quality || null,
      notes: notes || null,
      category: type === 'expense' ? data.category : null
    };

    if (transaction) {
      updateTransactionMutation.mutate({ id: transaction.id, data: formattedData });
    } else {
      try {
        // Create main transaction with expense included in total amount
        await createTransactionMutation.mutateAsync(formattedData);
        
        const expenseMsg = (type === 'purchase' || type === 'sale') && data.expenseAmount && parseFloat(data.expenseAmount) > 0
          ? ` (including ${data.expenseCategory} expense of ₹${data.expenseAmount})`
          : '';
        
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} created`,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction saved successfully${expenseMsg}`
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
        queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
        
        onClose();
        form.reset();
      } catch (error) {
        // Error already handled by mutation's onError
      }
    }
  };

  const getModalTitle = () => {
    const action = transaction ? 'Edit' : 'New';
    return `${action} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getModalDescription = () => {
    const action = transaction ? 'Update' : 'Record';
    return `${action} ${type} transaction details`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="transaction-modal">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type.charAt(0).toUpperCase() + type.slice(1)} Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-transaction-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="INV-001" 
                        {...field} 
                        data-testid="input-invoice-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type !== 'expense' && (
                <>
                  <FormField
                    control={form.control}
                    name="partyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party ({type === 'purchase' ? 'Supplier' : 'Customer'}) *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-transaction-party">
                              <SelectValue placeholder="Select party" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parties.map((party: any) => (
                              <SelectItem key={party.id} value={party.id}>
                                {party.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cropId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-transaction-crop">
                              <SelectValue placeholder="Select crop" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {crops.map((crop: any) => (
                              <SelectItem key={crop.id} value={crop.id}>
                                {crop.name} {crop.variety && `- ${crop.variety}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.001"
                            placeholder="0.00" 
                            {...field} 
                            data-testid="input-transaction-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate per Unit *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                            data-testid="input-transaction-rate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2 border-t pt-4 mt-2">
                    <h4 className="text-sm font-medium mb-3">Optional Expense (Transportation, Labor, etc.)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expenseCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expense Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-purchase-sale-expense-category">
                                  <SelectValue placeholder="Select category (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Transportation">Transportation</SelectItem>
                                <SelectItem value="Labor">Labor</SelectItem>
                                <SelectItem value="Storage">Storage</SelectItem>
                                <SelectItem value="Commission">Commission</SelectItem>
                                <SelectItem value="Packaging">Packaging</SelectItem>
                                <SelectItem value="Loading">Loading/Unloading</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expenseAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expense Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                data-testid="input-purchase-sale-expense-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {type === 'expense' && (
                <>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expense Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expense-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                            <SelectItem value="Labor">Labor</SelectItem>
                            <SelectItem value="Storage">Storage</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor/Party</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expense-party">
                              <SelectValue placeholder="Select party (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parties.map((party: any) => (
                              <SelectItem key={party.id} value={party.id}>
                                {party.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field} 
                        data-testid="input-transaction-amount"
                        readOnly={type !== 'expense' && !!(quantity && rate)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-mode">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 'sale' && (
                <>
                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Grade</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="A, B, C, etc."
                            {...field} 
                            data-testid="input-quality"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes or remarks..."
                      rows={3}
                      {...field} 
                      data-testid="textarea-transaction-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-transaction"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTransactionMutation.isPending || createExpenseMutation.isPending || updateTransactionMutation.isPending}
                data-testid="button-save-transaction"
              >
                {createTransactionMutation.isPending || createExpenseMutation.isPending || updateTransactionMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {transaction ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  transaction ? `Update ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
