import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VoiceFeedbackProvider } from "@/contexts/VoiceFeedbackContext";
import { AccessibilityEnhancements } from "@/components/AccessibilityEnhancements";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <VoiceFeedbackProvider language="en-US">
      <TooltipProvider>
        <AccessibilityEnhancements>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AccessibilityEnhancements>
      </TooltipProvider>
    </VoiceFeedbackProvider>
  </QueryClientProvider>
);

export default App;
