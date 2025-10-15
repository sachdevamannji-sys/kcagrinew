import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { cashRegisterApi } from '@/lib/api';
import { getTodayIST, formatDateForInput, dateStringToISTTimestamp } from '@/lib/timezone';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const cashEntryFormSchema = z.object({
  type: z.enum(['cash_in', 'cash_out']),
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  partyId: z.string().optional(),
  referenceNumber: z.string().optional()
});

type CashEntryFormData = z.infer<typeof cashEntryFormSchema>;

interface CashEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: 'cash_in' | 'cash_out';
  parties?: any[];
  editEntry?: any;
}

export default function CashEntryModal({ isOpen, onClose, entryType, parties = [], editEntry }: CashEntryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CashEntryFormData>({
    resolver: zodResolver(cashEntryFormSchema),
    defaultValues: {
      type: entryType,
      date: getTodayIST(),
      amount: '',
      description: '',
      partyId: '',
      referenceNumber: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        form.reset({
          type: editEntry.type,
          date: formatDateForInput(editEntry.date),
          amount: editEntry.amount.toString(),
          description: editEntry.description,
          partyId: editEntry.partyId || '',
          referenceNumber: editEntry.reference || ''
        });
      } else {
        form.reset({
          type: entryType,
          date: getTodayIST(),
          amount: '',
          description: '',
          partyId: '',
          referenceNumber: ''
        });
      }
    }
  }, [isOpen, entryType, editEntry, form]);

  const createEntryMutation = useMutation({
    mutationFn: cashRegisterApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cash-register'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cash-register/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ledger'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parties/with-balance'] });
      toast({
        title: 'Success',
        description: 'Cash entry recorded successfully.',
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record cash entry.',
        variant: 'destructive',
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CashEntryFormData }) => cashRegisterApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cash-register'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cash-register/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ledger'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parties/with-balance'] });
      toast({
        title: 'Success',
        description: 'Cash entry updated successfully.',
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update cash entry.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CashEntryFormData) => {
    // Convert date to IST timestamp before sending
    const formattedData = {
      ...data,
      date: dateStringToISTTimestamp(data.date)
    };

    if (editEntry) {
      updateEntryMutation.mutate({ id: editEntry.id, data: formattedData });
    } else {
      createEntryMutation.mutate(formattedData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editEntry ? 'Edit Cash Entry' : (entryType === 'cash_in' ? 'Cash In Entry' : 'Cash Out Entry')}
          </DialogTitle>
          <DialogDescription>
            {editEntry 
              ? 'Update the cash entry details' 
              : (entryType === 'cash_in' 
                ? 'Record money received into the cash register' 
                : 'Record money paid out from the cash register')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-cash-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash_in">Cash In</SelectItem>
                      <SelectItem value="cash_out">Cash Out</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                      data-testid="input-cash-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      data-testid="input-cash-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter description"
                      {...field}
                      data-testid="input-cash-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {parties && parties.length > 0 && (
              <FormField
                control={form.control}
                name="partyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cash-party">
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
            )}

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cheque/Transaction reference"
                      {...field}
                      data-testid="input-cash-reference"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-cash"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                data-testid="button-submit-cash"
              >
                {(createEntryMutation.isPending || updateEntryMutation.isPending) 
                  ? 'Saving...' 
                  : (editEntry ? 'Update Entry' : 'Save Entry')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
