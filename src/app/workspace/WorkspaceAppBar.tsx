
import { AriaButton } from "@/components/ui/aria-button";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "@/components/ui/aria-menu";
import { cn } from "@/lib/utils";
import {
  FileText,
  Moon,
  MoreVertical,
  Settings,
  Sun
} from "lucide-react";
import { Suspense } from "react";
import { useResolvedPath } from "react-router-dom";
import { Navbar, NavbarContent } from "../../components/ui/navbar";
import { AppGlobals } from "../../globals";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { LazyAppBarCollab } from "../blocknote/lazy/collab";
import { LazyDocPersistenceToggle } from "../blocknote/lazy/storage";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { DocTitle } from "../shared/DocTitle";
import { $settingsStore } from "../shared/SettingsDialog";

export default function AppBar({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const newPath = useResolvedPath("/new");
  const { frontmatter } = AppGlobals;

  return (
    <Navbar className={cn("sticky top-0 z-50", className)}>
      <NavbarContent>
          <SidebarTrigger className="-ml-1" />
      </NavbarContent>
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
