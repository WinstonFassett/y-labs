import { Button } from "@/components/ui/button";

import { AriaButton } from "@/components/ui/aria-button";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "@/components/ui/aria-menu";
import { cn } from "@/lib/utils";
import {
  FileText,
  HardDriveIcon,
  Moon,
  MoreVertical,
  Settings,
  Sun,
} from "lucide-react";
import { Suspense } from "react";
import { useResolvedPath } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent } from "../../components/ui/navbar";
import { AppGlobals } from "../../globals";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { LazyAppBarCollab } from "../blocknote/lazy/collab";
import { LazyDocPersistenceToggle } from "../blocknote/lazy/storage";
import { DocTitle } from "./DocTitle";
import { $settingsStore } from "./SettingsDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AppBar({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const newPath = useResolvedPath("/new");
  const { frontmatter } = AppGlobals;

  return (
    <Navbar className={cn("sticky top-0 z-50", className)}>
      <NavbarContent>
          <SidebarTrigger className="-ml-1" />
      </NavbarContent>

      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">files</BreadcrumbLink>
              </BreadcrumbItem>              
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>button.tsx</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
        </header>
      <NavbarContent className="flex-1 items-center gap-2">
        <DocTitle />
      </NavbarContent>
      <NavbarContent className="items-center gap-2">
        <Suspense>
          <LazyAppBarCollab />
        </Suspense>
        <Suspense>
          <LazyDocPersistenceToggle />
        </Suspense>        
        <MenuTrigger>
          <AriaButton aria-label="Menu" size="icon" variant="ghost" className="rounded-full">
            <MoreVertical size={20} />
          </AriaButton>
          <MenuPopover>
            <Menu>
              <MenuItem href="#/new">
                <FileText size={16} />
                New Document                
              </MenuItem>
              <MenuItem
                onAction={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="flex items-center gap-2"
              >
                {
                  theme === "light" 
                    ? <Sun size={16} /> 
                    : <Moon size={16} />
                }
                Change Theme
              </MenuItem>
              <MenuItem
                onAction={() => {
                  $settingsStore.setKey("show", true);
                }}
              >
                <Settings size={16} />
                Settings
              </MenuItem>
            </Menu>
          </MenuPopover>
        </MenuTrigger>

      </NavbarContent>
    </Navbar>
  );
}
