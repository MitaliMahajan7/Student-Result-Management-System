import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FilePlus2, FileText, BookOpen, GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar } from
"@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const { state } = useSidebar();
  const { role } = useAuth();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
  { title: "Students", url: "/students", icon: Users, roles: ["admin", "teacher"] },
  { title: "Add Result", url: "/add-result", icon: FilePlus2, roles: ["admin", "teacher"] },
  { title: "Results", url: "/results", icon: FileText, roles: ["admin", "teacher", "student"] },
  { title: "Subjects", url: "/subjects", icon: BookOpen, roles: ["admin"] }].
  filter((i) => !role || i.roles.includes(role));

  const isActive = (path) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid place-items-center h-8 w-8 rounded-md bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed &&
          <div className="leading-tight">
              <div className="font-semibold text-sidebar-foreground">SRMS</div>
              <div className="text-xs text-sidebar-foreground/70">Result Management</div>
            </div>
          }
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>);

}