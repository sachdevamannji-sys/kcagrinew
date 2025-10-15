import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Package, DollarSign, CreditCard, FileText, Tag, ShoppingCart } from 'lucide-react';

interface SalePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  partyName?: string;
  cropName?: string;
  cropUnit?: string;
}

export default function SalePreviewModal({ 
  isOpen, 
  onClose, 
  sale,
  partyName,
  cropName,
  cropUnit 
}: SalePreviewModalProps) {
  if (!sale) return null;

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
      month: 'long',
      year: 'numeric'
    });
  };

  const formatQuantity = (quantity: string | number, unit: string = 'Quintal') => {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    return `${num.toFixed(2)} ${unit}`;
  };

  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'credit': return 'bg-blue-100 text-blue-800';
      case 'online': return 'bg-purple-100 text-purple-800';
      case 'cheque': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="sale-preview-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sale Details</DialogTitle>
          <DialogDescription>
            Complete information about this sale transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Invoice Number */}
                {sale.invoiceNumber && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice Number</p>
                      <p className="font-semibold" data-testid="text-invoice-number">{sale.invoiceNumber}</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sale Date</p>
                    <p className="font-semibold" data-testid="text-sale-date">{formatDate(sale.date)}</p>
                  </div>
                </div>

                {/* Party Name */}
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Customer/Party</p>
                    <p className="font-semibold" data-testid="text-party-name">{partyName || 'N/A'}</p>
                  </div>
                </div>

                {/* Crop Name */}
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Crop/Product</p>
                    <p className="font-semibold" data-testid="text-crop-name">{cropName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Quantity & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Quantity */}
                <div className="flex items-start gap-3">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold text-lg" data-testid="text-quantity">
                      {formatQuantity(sale.quantity || 0, cropUnit)}
                    </p>
                  </div>
                </div>

                {/* Rate */}
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rate per {cropUnit || 'Unit'}</p>
                    <p className="font-semibold text-lg" data-testid="text-rate">
                      {formatCurrency(sale.rate || 0)}
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-xl text-blue-600" data-testid="text-total-amount">
                      {formatCurrency(sale.amount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Payment Mode */}
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Mode</p>
                    <Badge 
                      className={getPaymentModeColor(sale.paymentMode || 'cash')}
                      data-testid="badge-payment-mode"
                    >
                      {(sale.paymentMode || 'cash').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Payment Status */}
                {sale.paymentStatus && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge 
                        className={getPaymentStatusColor(sale.paymentStatus)}
                        data-testid="badge-payment-status"
                      >
                        {sale.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          {(sale.quality || sale.notes || sale.category) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sale.quality && (
                  <div>
                    <p className="text-sm text-muted-foreground">Quality</p>
                    <p className="font-medium" data-testid="text-quality">{sale.quality}</p>
                  </div>
                )}
                {sale.category && (
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium" data-testid="text-category">{sale.category}</p>
                  </div>
                )}
                {sale.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium" data-testid="text-notes">{sale.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer Timestamps */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Created: {new Date(sale.createdAt).toLocaleString('en-IN')}</p>
            {sale.updatedAt && sale.updatedAt !== sale.createdAt && (
              <p>Last Updated: {new Date(sale.updatedAt).toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
