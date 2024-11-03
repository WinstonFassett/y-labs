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

export default function AppBar() {
  const [theme, setTheme] = useTheme();
  const newPath = useResolvedPath("/new");
  const { frontmatter } = AppGlobals;

  return (
    <Navbar isBordered className="bg-transparent" maxWidth="full">
      <NavbarContent justify="start">
        <NavbarBrand className="gap-4">
          <Button
            title="Saved Documents"
            isIconOnly
            variant="light"
            as="a"
            href="/y-labs/app/drive/index.html"
            className="block flex items-center"
          >
            <HardDriveIcon className="h-5 w-5" />
          </Button>

          <Suspense>
            <LazyDocPersistenceToggle />
          </Suspense>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="items-center gap-2" justify="center">
        <DocTitle />
      </NavbarContent>
      <NavbarContent className="items-center gap-2" justify="end">
        <Suspense>
          <LazyAppBarCollab />
        </Suspense>

        <DropdownMenu>
          <DropdownMenuTrigger>
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
