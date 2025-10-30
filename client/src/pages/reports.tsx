import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { dashboardApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: dashboardApi.getMetrics,
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

  const reportTypes = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Detailed sales analysis by party, crop, and period',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
      monthlyValue: formatCurrency(metrics?.totalSales || 0),
      yearlyValue: formatCurrency(metrics?.totalSales || 0)
    },
    {
      id: 'purchase',
      title: 'Purchase Report',
      description: 'Purchase summary with party and crop breakdown',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      monthlyValue: formatCurrency(metrics?.totalPurchases || 0),
      yearlyValue: formatCurrency(metrics?.totalPurchases || 0)
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels and valuation by crop',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      monthlyValue: `${metrics?.totalCrops || 0} crops`,
      yearlyValue: formatCurrency(metrics?.inventoryValue || 0)
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss Report',
      description: 'Comprehensive P&L statement with margins',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      color: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      monthlyValue: formatCurrency(metrics?.netProfit || 0),
      yearlyValue: 'Margin calculated'
    },
    {
      id: 'expense',
      title: 'Expense Report',
      description: 'Expense tracking by category and period',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      monthlyValue: formatCurrency(metrics?.totalExpenses || 0),
      yearlyValue: 'By categories'
    },
    {
      id: 'ledger',
      title: 'Ledger Report',
      description: 'Party-wise ledger with outstanding balances',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'bg-red-500/10',
      iconColor: 'text-red-500',
      monthlyValue: 'Party-wise',
      yearlyValue: 'Outstanding tracking'
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    const reportRoutes: { [key: string]: string } = {
      'sales': '/sales',
      'purchase': '/purchase',
      'inventory': '/inventory',
      'expense': '/expenses',
      'ledger': '/ledger',
      'profit-loss': '/dashboard'
    };
    
    const route = reportRoutes[reportId];
    if (route) {
      setLocation(route);
    }
  };

  return (
    <div>
      <Header title="Reports & Analytics" subtitle="Comprehensive business insights and reports" />
      <div className="p-8">
        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report) => (
            <Card 
              key={report.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              data-testid={`report-card-${report.id}`}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center mb-4`}>
                  <svg className={`w-6 h-6 ${report.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={report.icon} />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{report.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month:</span>
                    <span className="font-medium">{report.monthlyValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Year:</span>
                    <span className="font-medium">{report.yearlyValue}</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleGenerateReport(report.id)}
                  data-testid={`button-generate-${report.id}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Report Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
            <CardDescription>Generate customized reports with specific parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="purchase">Purchase Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="profit-loss">P&L Report</SelectItem>
                    <SelectItem value="expense">Expense Report</SelectItem>
                    <SelectItem value="ledger">Ledger Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger data-testid="select-export-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  className="w-full" 
                  onClick={handleGenerateReport}
                  disabled={!reportType}
                  data-testid="button-generate-custom-report"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    data-testid="input-custom-date-from"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    data-testid="input-custom-date-to"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setReportType('');
                  setDateRange('');
                  setDateFrom('');
                  setDateTo('');
                }}
                data-testid="button-reset-report-form"
              >
                Reset
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={!reportType}
                data-testid="button-generate-final-report"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated reports and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8" data-testid="recent-reports-empty">
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="text-lg font-medium text-foreground mb-2">No reports generated yet</h4>
              <p className="text-muted-foreground">
                Generate your first report using the options above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
