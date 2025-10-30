import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardCharts from '@/components/charts/dashboard-charts';
import Header from '@/components/layout/header';
import { useEffect } from 'react';
export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: dashboardApi.getMetrics,
  });
  useEffect(() => {
    if (metrics) {
      console.log('📊 Dashboard Metrics Data:', metrics);
    }
  }, [metrics]);
  if (isLoading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Overview of your crop trading operations" />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const metricCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(metrics?.totalSales || 0),
      change: '+12.5%',
      changeType: 'positive',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      color: 'text-primary'
    },
    {
      title: 'Total Purchases',
      value: formatCurrency(metrics?.totalPurchases || 0),
      change: '+8.2%',
      changeType: 'positive',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
      color: 'text-blue-500'
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(metrics?.inventoryValue || 0),
      change: `${metrics?.lowStockItems || 0} low stock items`,
      changeType: 'neutral',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'text-amber-500'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(metrics?.netProfit || 0),
      change: '+15.8%',
      changeType: 'positive',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'text-purple-500'
    }
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your crop trading operations" />
      <div className="p-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow" data-testid={`card-${metric.title.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </h3>
                  <div className={`w-10 h-10 ${metric.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${metric.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground" data-testid={`value-${metric.title.toLowerCase().replace(' ', '-')}`}>
                      {metric.value}
                    </p>
                    <p className={`text-xs mt-1 ${
                      metric.changeType === 'positive' ? 'text-emerald-600' : 
                      metric.changeType === 'negative' ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {metric.changeType === 'positive' && '↗ '}
                      {metric.changeType === 'negative' && '↘ '}
                      {metric.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <DashboardCharts />

        {/* Recent Activity and Outstanding Balances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest business activities</CardDescription>
              </div>
              <button className="text-sm text-primary hover:underline" data-testid="link-view-all-transactions">
                View All
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-muted rounded-lg" data-testid="recent-transactions-empty">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                    <p className="text-xs text-muted-foreground mt-1">Start by adding purchases or sales</p>
                  </div>
                  <span className="text-sm font-medium">₹0</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Outstanding Balances</CardTitle>
                <CardDescription>Pending payments and receivables</CardDescription>
              </div>
              <button className="text-sm text-primary hover:underline" data-testid="link-manage-balances">
                Manage
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-muted rounded-lg" data-testid="outstanding-balances-empty">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-muted-foreground">No outstanding balances</p>
                    <p className="text-xs text-muted-foreground mt-1">All payments are up to date</p>
                  </div>
                  <span className="text-sm font-medium">₹0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
