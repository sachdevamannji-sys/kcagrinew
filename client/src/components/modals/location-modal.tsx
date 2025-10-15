import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { statesApi, citiesApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const stateFormSchema = z.object({
  name: z.string().min(1, 'State name is required'),
  code: z.string().optional()
});

const cityFormSchema = z.object({
  name: z.string().min(1, 'City name is required'),
  stateId: z.string().min(1, 'State is required')
});

type StateFormData = z.infer<typeof stateFormSchema>;
type CityFormData = z.infer<typeof cityFormSchema>;

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: any;
  type: 'state' | 'city';
  states: any[];
}

export default function LocationModal({ isOpen, onClose, location, type, states }: LocationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stateForm = useForm<StateFormData>({
    resolver: zodResolver(stateFormSchema),
    defaultValues: {
      name: '',
      code: ''
    }
  });

  const cityForm = useForm<CityFormData>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: '',
      stateId: ''
    }
  });

  const createStateMutation = useMutation({
    mutationFn: statesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/states'] });
      toast({
        title: 'Success',
        description: 'State created successfully.',
      });
      onClose();
      stateForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create state.',
        variant: 'destructive',
      });
    },
  });

  const updateStateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => statesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/states'] });
      toast({
        title: 'Success',
        description: 'State updated successfully.',
      });
      onClose();
      stateForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update state.',
        variant: 'destructive',
      });
    },
  });

  const createCityMutation = useMutation({
    mutationFn: citiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      toast({
        title: 'Success',
        description: 'City created successfully.',
      });
      onClose();
      cityForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create city.',
        variant: 'destructive',
      });
    },
  });

  const updateCityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => citiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      toast({
        title: 'Success',
        description: 'City updated successfully.',
      });
      onClose();
      cityForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update city.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (location) {
      if (type === 'state') {
        stateForm.reset({
          name: location.name || '',
          code: location.code || ''
        });
      } else {
        cityForm.reset({
          name: location.name || '',
          stateId: location.stateId || ''
        });
      }
    } else {
      if (type === 'state') {
        stateForm.reset({
          name: '',
          code: ''
        });
      } else {
        cityForm.reset({
          name: '',
          stateId: ''
        });
      }
    }
  }, [location, type, stateForm, cityForm]);

  const onSubmitState = (data: StateFormData) => {
    const formattedData = {
      ...data,
      code: data.code || null
    };

    if (location) {
      updateStateMutation.mutate({ id: location.id, data: formattedData });
    } else {
      createStateMutation.mutate(formattedData);
    }
  };

  const onSubmitCity = (data: CityFormData) => {
    if (location) {
      updateCityMutation.mutate({ id: location.id, data });
    } else {
      createCityMutation.mutate(data);
    }
  };

  const isLoading = createStateMutation.isPending || updateStateMutation.isPending || 
                   createCityMutation.isPending || updateCityMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="location-modal">
        <DialogHeader>
          <DialogTitle>
            {location ? `Edit ${type}` : `Add New ${type}`}
          </DialogTitle>
          <DialogDescription>
            {location 
              ? `Update ${type} information` 
              : `Create a new ${type} for your location hierarchy`
            }
          </DialogDescription>
        </DialogHeader>

        {type === 'state' ? (
          <Form {...stateForm}>
            <form onSubmit={stateForm.handleSubmit(onSubmitState)} className="space-y-4">
              <FormField
                control={stateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Maharashtra, Punjab" 
                        {...field} 
                        data-testid="input-state-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stateForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., MH, PB" 
                        {...field} 
                        data-testid="input-state-code"
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
                  data-testid="button-cancel-state"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-save-state"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {location ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    location ? 'Update State' : 'Create State'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...cityForm}>
            <form onSubmit={cityForm.handleSubmit(onSubmitCity)} className="space-y-4">
              <FormField
                control={cityForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Mumbai, Ludhiana" 
                        {...field} 
                        data-testid="input-city-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={cityForm.control}
                name="stateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-city-state">
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

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-city"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-save-city"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {location ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    location ? 'Update City' : 'Create City'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
