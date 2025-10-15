import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

declare global {
  interface Window {
    Chart: any;
  }
}

export default function DashboardCharts() {
  const salesPurchaseChartRef = useRef<HTMLCanvasElement>(null);
  const cropDistributionChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load Chart.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = initializeCharts;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeCharts = () => {
    if (!window.Chart) return;

    // Sales vs Purchase Chart
    if (salesPurchaseChartRef.current) {
      new window.Chart(salesPurchaseChartRef.current, {
        type: 'line',
        data: {
          labels: ['Sep 27', 'Sep 28', 'Sep 29', 'Sep 30', 'Oct 01', 'Oct 02'],
          datasets: [
            {
              label: 'Sales',
              data: [0, 0, 0, 0, 0, 0],
              borderColor: 'hsl(142 70% 45%)',
              backgroundColor: 'hsl(142 70% 45% / 0.1)',
              tension: 0.4,
              fill: false
            },
            {
              label: 'Purchases',
              data: [0, 0, 250000, 0, 0, 0],
              borderColor: 'hsl(199 89% 48%)',
              backgroundColor: 'hsl(199 89% 48% / 0.1)',
              tension: 0.4,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return '₹' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Crop Distribution Chart
    if (cropDistributionChartRef.current) {
      new window.Chart(cropDistributionChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['PADDY PR 14', 'PADDY 1509', 'Wheat HD-2967'],
          datasets: [{
            data: [88, 1, 11],
            backgroundColor: [
              'hsl(199 89% 48%)',
              'hsl(142 70% 45%)',
              'hsl(38 92% 50%)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card data-testid="card-sales-purchase-trend">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales vs Purchase Trend</CardTitle>
            <CardDescription>Compare your sales and purchase patterns</CardDescription>
          </div>
          <Select defaultValue="7days">
            <SelectTrigger className="w-32" data-testid="select-trend-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <canvas ref={salesPurchaseChartRef} data-testid="chart-sales-purchase" />
          </div>
        </CardContent>
      </Card>
      
      <Card data-testid="card-crop-distribution">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Crop Distribution</CardTitle>
            <CardDescription>Breakdown of crop inventory by type</CardDescription>
          </div>
          <button className="text-sm text-primary hover:underline" data-testid="button-view-crop-details">
            View Details
          </button>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <canvas ref={cropDistributionChartRef} data-testid="chart-crop-distribution" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm" data-testid="crop-paddy-pr14">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-chart-1 rounded-full mr-2"></div>
                <span>PADDY PR 14</span>
              </div>
              <span className="font-medium">88%</span>
            </div>
            <div className="flex items-center justify-between text-sm" data-testid="crop-paddy-1509">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-chart-2 rounded-full mr-2"></div>
                <span>PADDY 1509</span>
              </div>
              <span className="font-medium">1%</span>
            </div>
            <div className="flex items-center justify-between text-sm" data-testid="crop-wheat">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-chart-3 rounded-full mr-2"></div>
                <span>Wheat HD-2967</span>
              </div>
              <span className="font-medium">11%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
