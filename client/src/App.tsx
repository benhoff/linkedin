import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "./components/layout/sidebar";
import { Topbar } from "./components/layout/topbar";
import DraftEdit from "./pages/draft-edit";
import HookLab from "./pages/hook-lab";
import CtaLab from "./pages/cta-lab";
import GraphicsLab from "./pages/graphics-lab";
import StoryEditor from "./pages/story-editor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DraftEdit} />
      <Route path="/draft-edit" component={DraftEdit} />
      <Route path="/hook-lab" component={HookLab} />
      <Route path="/cta-lab" component={CtaLab} />
      <Route path="/graphics-lab" component={GraphicsLab} />
      <Route path="/story-editor" component={StoryEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Topbar />
            <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
              <Router />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
