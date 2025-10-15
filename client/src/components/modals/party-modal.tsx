import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { partiesApi, citiesApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const partyFormSchema = z.object({
  name: z.string().min(1, 'Party name is required'),
  type: z.enum(['farmer', 'trader', 'contractor', 'thekedar', 'company', 'other'], {
    required_error: 'Party type is required'
  }),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gstNumber: z.string().optional(),
  aadharCard: z.string().optional(),
  address: z.string().optional(),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  openingBalance: z.string().optional(),
  balanceType: z.enum(['credit', 'debit']).default('credit')
});

type PartyFormData = z.infer<typeof partyFormSchema>;

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  party?: any;
  states: any[];
}

export default function PartyModal({ isOpen, onClose, party, states }: PartyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PartyFormData>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: '',
      type: 'farmer',
      phone: '',
      email: '',
      gstNumber: '',
      aadharCard: '',
      address: '',
      stateId: '',
      cityId: '',
      openingBalance: '0',
      balanceType: 'credit'
    }
  });

  const selectedStateId = form.watch('stateId');

  const { data: cities } = useQuery({
    queryKey: ['/api/cities', selectedStateId],
    queryFn: () => citiesApi.getAll(selectedStateId),
    enabled: !!selectedStateId,
  });

  const createPartyMutation = useMutation({
    mutationFn: partiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      toast({
        title: 'Success',
        description: 'Party created successfully.',
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create party.',
        variant: 'destructive',
      });
    },
  });

  const updatePartyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => partiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      toast({
        title: 'Success',
        description: 'Party updated successfully.',
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update party.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (party) {
      form.reset({
        name: party.name || '',
        type: party.type || 'farmer',
        phone: party.phone || '',
        email: party.email || '',
        gstNumber: party.gstNumber || '',
        aadharCard: party.aadharCard || '',
        address: party.address || '',
        stateId: party.stateId || '',
        cityId: party.cityId || '',
        openingBalance: party.openingBalance || '0',
        balanceType: party.balanceType || 'credit'
      });
    } else {
      form.reset({
        name: '',
        type: 'farmer',
        phone: '',
        email: '',
        gstNumber: '',
        aadharCard: '',
        address: '',
        stateId: '',
        cityId: '',
        openingBalance: '0',
        balanceType: 'credit'
      });
    }
  }, [party, form]);

  const onSubmit = (data: PartyFormData) => {
    const formattedData = {
      ...data,
      email: data.email || null,
      gstNumber: data.gstNumber || null,
      aadharCard: data.aadharCard || null,
      address: data.address || null,
      stateId: data.stateId || null,
      cityId: data.cityId || null,
      openingBalance: data.openingBalance || '0'
    };

    if (party) {
      updatePartyMutation.mutate({ id: party.id, data: formattedData });
    } else {
      createPartyMutation.mutate(formattedData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="party-modal">
        <DialogHeader>
          <DialogTitle>
            {party ? 'Edit Party' : 'Add New Party'}
          </DialogTitle>
          <DialogDescription>
            {party ? 'Update party information' : 'Create a new party for your business transactions'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter party name" 
                        {...field} 
                        data-testid="input-party-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-party-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="trader">Trader</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="thekedar">Thekedar</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+91 XXXXX XXXXX" 
                        {...field} 
                        data-testid="input-party-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="party@example.com" 
                        {...field} 
                        data-testid="input-party-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="22AAAAA0000A1Z5" 
                        {...field} 
                        data-testid="input-party-gst"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aadharCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XXXX XXXX XXXX" 
                        {...field} 
                        data-testid="input-party-aadhar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-party-state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state: any) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
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
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-party-city">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities?.map((city: any) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
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
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Balance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                        data-testid="input-party-balance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-balance-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit">Credit (They owe us)</SelectItem>
                        <SelectItem value="debit">Debit (We owe them)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Complete address"
                      rows={3}
                      {...field} 
                      data-testid="textarea-party-address"
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
                data-testid="button-cancel-party"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPartyMutation.isPending || updatePartyMutation.isPending}
                data-testid="button-save-party"
              >
                {createPartyMutation.isPending || updatePartyMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {party ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  party ? 'Update Party' : 'Create Party'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
