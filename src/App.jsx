import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddResult from "./pages/AddResult";
import Results from "./pages/Results";
import Subjects from "./pages/Subjects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () =>
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
            element={
            <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
            }>
            
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
              path="/students"
              element={
              <ProtectedRoute allowed={["admin", "teacher"]}>
                    <Students />
                  </ProtectedRoute>
              } />
            
              <Route
              path="/add-result"
              element={
              <ProtectedRoute allowed={["admin", "teacher"]}>
                    <AddResult />
                  </ProtectedRoute>
              } />
            
              <Route path="/results" element={<Results />} />
              <Route
              path="/subjects"
              element={
              <ProtectedRoute allowed={["admin"]}>
                    <Subjects />
                  </ProtectedRoute>
              } />
            
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;


export default App;