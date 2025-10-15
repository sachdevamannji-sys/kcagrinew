import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { cropsApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const cropFormSchema = z.object({
  name: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional()
});

type CropFormData = z.infer<typeof cropFormSchema>;

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop?: any;
}

export default function CropModal({ isOpen, onClose, crop }: CropModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CropFormData>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      name: '',
      variety: '',
      category: '',
      unit: 'quintal',
      description: ''
    }
  });

  const createCropMutation = useMutation({
    mutationFn: cropsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Success',
        description: 'Crop created successfully.',
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create crop.',
        variant: 'destructive',
      });
    },
  });

  const updateCropMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cropsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Success',
        description: 'Crop updated successfully.',
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update crop.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (crop) {
      form.reset({
        name: crop.name || '',
        variety: crop.variety || '',
        category: crop.category || '',
        unit: crop.unit || 'quintal',
        description: crop.description || ''
      });
    } else {
      form.reset({
        name: '',
        variety: '',
        category: '',
        unit: 'quintal',
        description: ''
      });
    }
  }, [crop, form]);

  const onSubmit = (data: CropFormData) => {
    const formattedData = {
      ...data,
      variety: data.variety || null,
      category: data.category || null,
      description: data.description || null
    };

    if (crop) {
      updateCropMutation.mutate({ id: crop.id, data: formattedData });
    } else {
      createCropMutation.mutate(formattedData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="crop-modal">
        <DialogHeader>
          <DialogTitle>
            {crop ? 'Edit Crop' : 'Add New Crop'}
          </DialogTitle>
          <DialogDescription>
            {crop ? 'Update crop information' : 'Create a new crop variety for your inventory'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Wheat, Rice, Cotton" 
                      {...field} 
                      data-testid="input-crop-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variety</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., HD-2967, PR-14" 
                        {...field} 
                        data-testid="input-crop-variety"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-crop-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cereals">Cereals</SelectItem>
                        <SelectItem value="pulses">Pulses</SelectItem>
                        <SelectItem value="oilseeds">Oilseeds</SelectItem>
                        <SelectItem value="cash-crops">Cash Crops</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="spices">Spices</SelectItem>
                        <SelectItem value="fodder">Fodder</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit of Measurement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-crop-unit">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="quintal">Quintal</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="metric-ton">Metric Ton</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about the crop..."
                      rows={3}
                      {...field} 
                      data-testid="textarea-crop-description"
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
                data-testid="button-cancel-crop"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCropMutation.isPending || updateCropMutation.isPending}
                data-testid="button-save-crop"
              >
                {createCropMutation.isPending || updateCropMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {crop ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  crop ? 'Update Crop' : 'Create Crop'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
