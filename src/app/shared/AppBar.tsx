import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@nextui-org/react";
import { FileText, HardDriveIcon, Moon, MoreVertical, Sun } from "lucide-react";
import { Suspense } from "react";
import { useResolvedPath } from "react-router-dom";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { AppGlobals } from "../../globals";
import { DocTitle } from "./DocTitle";
import { LazyAppBarCollab } from "../blocknote/lazy/collab";
import { LazyDocPersistenceToggle } from "../blocknote/lazy/storage";

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
            href="/app/drive/index.html"
            className="block flex items-center"
          >
            <HardDriveIcon className="h-5 w-5" />
          </Button>

          <Suspense>
            <LazyDocPersistenceToggle />
          </Suspense>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent as="div" className="items-center gap-2" justify="center">
        <DocTitle />
      </NavbarContent>
      <NavbarContent as="div" className="items-center gap-2" justify="end">
        <Suspense>
          <LazyAppBarCollab />
        </Suspense>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" isIconOnly>
              <MoreVertical size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="More Actions"
            color="default"
            selectionMode="none"
          >
            <DropdownItem
              href={`#/new`}
              key="newDoc"
              endContent={<FileText size={16} />}
            >
              New Document
            </DropdownItem>
            <DropdownItem
              key="toggleTheme"
              endContent={
                theme === "light" ? <Sun size={16} /> : <Moon size={16} />
              }
              closeOnSelect={false}
              onPress={(e) => {
                console.log("click");
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              Change Theme
            </DropdownItem>
            {/* 
            <DropdownItem key="settings" endContent={<Settings size={16} />}>
              Settings
            </DropdownItem> */}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
