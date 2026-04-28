import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "./AIAssistant";

export default function AppLayout() {
  const { signOut, user, role } = useAuth();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-card/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 gap-3">
            <SidebarTrigger />
            <div className="flex-1" />
            {role &&
            <Badge variant="secondary" className="capitalize">
                {role}
              </Badge>
            }
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
        <AIAssistant />
      </div>
    </SidebarProvider>);

}