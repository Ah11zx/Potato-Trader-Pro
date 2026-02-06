import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import SalesPage from "@/pages/Sales";
import PurchasesPage from "@/pages/Purchases";
import CustomersPage from "@/pages/Customers";
import NotFound from "@/pages/not-found";

function PageWithLayout({ component: Component }: { component: React.ComponentType }) {
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PageWithLayout component={Dashboard} />} />
      <Route path="/sales" component={() => <PageWithLayout component={SalesPage} />} />
      <Route path="/purchases" component={() => <PageWithLayout component={PurchasesPage} />} />
      <Route path="/customers" component={() => <PageWithLayout component={CustomersPage} />} />
      <Route path="/suppliers" component={() => <PageWithLayout component={Dashboard} />} />
      <Route path="/inventory" component={() => <PageWithLayout component={Dashboard} />} />
      <Route path="/expenses" component={() => <PageWithLayout component={Dashboard} />} />
      <Route path="/reports" component={() => <PageWithLayout component={Dashboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
