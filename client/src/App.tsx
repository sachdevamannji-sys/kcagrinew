import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth.tsx";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import PartiesPage from "@/pages/parties";
import CropsPage from "@/pages/crops";
import LocationsPage from "@/pages/locations";
import PurchasePage from "@/pages/purchase";
import SalesPage from "@/pages/sales";
import ExpensesPage from "@/pages/expenses";
import InventoryPage from "@/pages/inventory";
import LedgerPage from "@/pages/ledger";
import ReportsPage from "@/pages/reports";
import RokarPage from "@/pages/rokar";
import TrashPage from "@/pages/trash";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/parties" component={PartiesPage} />
            <Route path="/crops" component={CropsPage} />
            <Route path="/locations" component={LocationsPage} />
            <Route path="/purchase" component={PurchasePage} />
            <Route path="/sales" component={SalesPage} />
            <Route path="/expenses" component={ExpensesPage} />
            <Route path="/inventory" component={InventoryPage} />
            <Route path="/ledger" component={LedgerPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/rokar" component={RokarPage} />
            <Route path="/trash" component={TrashPage} />
            <Route>
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                <p className="text-gray-600">The page you're looking for doesn't exist.</p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
