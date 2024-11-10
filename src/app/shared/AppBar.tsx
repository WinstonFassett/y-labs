import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  HardDriveIcon,
  Moon,
  MoreVertical,
  Sun,
  Settings,
} from "lucide-react";
import { Suspense } from "react";
import { useResolvedPath } from "react-router-dom";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { AppGlobals } from "../../globals";
import { DocTitle } from "./DocTitle";
import { LazyAppBarCollab } from "../blocknote/lazy/collab";
import { LazyDocPersistenceToggle } from "../blocknote/lazy/storage";
import { $settingsStore } from "./SettingsDialog";
import { Navbar, NavbarContent, NavbarBrand } from "../../components/ui/navbar";
import { cn } from "@/lib/utils";

export default function AppBar({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const newPath = useResolvedPath("/new");
  const { frontmatter } = AppGlobals;

  return (
    <Navbar isBordered className={cn("gap-2 flex z-50 w-full h-auto items-center justify-center data-[menu-open=true]:border-none fixed inset-x-0 border-b border-divider backdrop-blur-lg data-[menu-open=true]:backdrop-blur-xl backdrop-saturate-150 bg-transparent max-w-3xl mx-auto", className)} maxWidth="full">
      <NavbarContent justify="start">
        <NavbarBrand className="gap-4">
          <Button
            asChild
            title="Saved Documents"
            isIconOnly
            variant="light"
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="light" isIconOnly>
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            aria-label="More Actions"
            color="default"
            selectionMode="none"
          >
            <DropdownMenuItem
              href={`#/new`}
              key="newDoc"
              endContent={<FileText size={16} />}
            >
              New Document
            </DropdownMenuItem>

            <DropdownMenuItem
              key="toggleTheme"
              endContent={
                theme === "light" ? <Sun size={16} /> : <Moon size={16} />
              }
              closeOnSelect={false}
              onClick={(e) => {
                console.log("click");
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              Change Theme
            </DropdownMenuItem>
            <DropdownMenuItem
              key="settings"
              endContent={<Settings size={16} />}
              onClick={() => {
                $settingsStore.setKey("show", true);
              }}
            >
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </NavbarContent>
    </Navbar>
  );
}
