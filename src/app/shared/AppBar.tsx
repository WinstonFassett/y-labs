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

export default function AppBar({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const newPath = useResolvedPath("/new");
  const { frontmatter } = AppGlobals;

  return (
    <Navbar className={cn("gap-2 flex z-50 w-full h-auto items-center justify-center data-[menu-open=true]:border-none sticky top-0 inset-x-0 border-b border-divider backdrop-blur-lg data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-transparent max-w-3xl mx-auto", className)} maxWidth="full">
      <NavbarContent>
        <NavbarBrand className="gap-1 sm:gap-2">
          <Button
            asChild
            title="Saved Documents"
            variant="ghost"
            className="block flex items-center"
          >
            <a href="/y-labs/app/drive/index.html">
              <HardDriveIcon className="h-5 w-5" />
            </a>
          </Button>

          <Suspense>
            <LazyDocPersistenceToggle />
          </Suspense>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="flex-1 items-center gap-2">
        <DocTitle />
      </NavbarContent>
      <NavbarContent className="items-center gap-2" justify="end">
        <Suspense>
          <LazyAppBarCollab />
        </Suspense>
        <MenuTrigger>
          <AriaButton aria-label="Menu" size="icon" variant="outline" className="rounded-full">
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
                  console.log("click");
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
                className=""
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
