import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Intake from "./pages/Intake";
import Dashboard from "./pages/Dashboard";
import CategoryResults from "./pages/CategoryResults";
import ResourceDetail from "./pages/ResourceDetail";
import LenderResults from "./pages/LenderResults";
import LenderDetail from "./pages/LenderDetail";
import SavedItems from "./pages/SavedItems";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResources from "./pages/admin/AdminResources";
import AdminLenders from "./pages/admin/AdminLenders";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import SubmitResource from "./pages/SubmitResource";
import AboutFaq from "./pages/AboutFaq";
import Privacy from "./pages/Privacy";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import CrisisSupport from "./pages/CrisisSupport";
import Assistant from "./pages/Assistant";
import ResourceMap from "./pages/ResourceMap";
import DigestSettings from "./pages/DigestSettings";
import SubscriptionManage from "./pages/SubscriptionManage";
import Pricing from "./pages/Pricing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/intake" component={Intake} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/resources/:categorySlug" component={CategoryResults} />
      <Route path="/resource/:id" component={ResourceDetail} />
      <Route path="/lenders" component={LenderResults} />
      <Route path="/lender/:id" component={LenderDetail} />
      <Route path="/saved" component={SavedItems} />
      <Route path="/submit-resource" component={SubmitResource} />
      <Route path="/about" component={AboutFaq} />
      <Route path="/privacy" component={Privacy} />
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/resources" component={AdminResources} />
      <Route path="/admin/lenders" component={AdminLenders} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route path="/admin/submissions" component={AdminSubmissions} />
      <Route path="/crisis" component={CrisisSupport} />
      <Route path="/assistant" component={Assistant} />
      <Route path="/map" component={ResourceMap} />
      <Route path="/digest" component={DigestSettings} />
      <Route path="/subscription" component={SubscriptionManage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/category/:categorySlug" component={CategoryResults} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <NavBar />
          <Router />
          <Footer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
