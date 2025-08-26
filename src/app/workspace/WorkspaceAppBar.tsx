import { AriaButton } from "@/components/ui/aria-button";
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/aria-menu";
import { cn } from "@/lib/utils";
import {
  DownloadIcon,
  FileText,
  Moon,
  MoreVertical,
  Settings,
  Sun,
  UploadIcon,
} from "lucide-react";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { Navbar, NavbarContent } from "../../components/ui/navbar";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { LazyAppBarCollab } from "../blocknote/lazy/collab";
import { LazyDocPersistenceToggle } from "../blocknote/lazy/storage";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { doExport, doExportJson } from "../drive/ExportDriveButton";
import { startImport } from "../drive/ImportDrive";
import { DocTitle } from "../shared/DocTitle";
import { $settingsStore } from "../shared/SettingsDialog";
import { ShareDialog } from "../shared/ShareDialog";
import { useVersionHistory } from "../shared/useVersionHistory";
import { createDocumentState } from "./CreateDocumentDialog";

export default function AppBar({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const { docId, type } = useParams<{ docId: string; type?: string }>();
  const { showVersionHistory, toggleVersionHistory } = useVersionHistory()
  const hasDoc = !!docId;

  return (
    <Navbar key={docId} className={cn("sticky top-0 z-50", className)}>
      <NavbarContent>
        <SidebarTrigger className="ml-2" />
      </NavbarContent>
      {docId && (
        <>
          <NavbarContent className="flex-1 items-center gap-1 sm:gap-2">
            <DocTitle />
          </NavbarContent>
          <NavbarContent className="items-center gap-1 sm:gap-2">
            <Suspense>
              <LazyDocPersistenceToggle />
            </Suspense>
            <Suspense>
              <LazyAppBarCollab />
            </Suspense>
            <ShareDialog type={type} />
          </NavbarContent>
        </>
      )}
      <NavbarContent>
        <MenuTrigger>
          <AriaButton
            aria-label="Menu"
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <MoreVertical size={20} />
          </AriaButton>
          <MenuPopover>
            <Menu>
              <MenuItem
                onAction={() => {
                  createDocumentState.open();
                }}
              >
                <FileText size={16} />
                New Document
              </MenuItem>

              <MenuSeparator />

              {hasDoc && (<>
                <MenuItem onAction={toggleVersionHistory}>
                  <FileText size={16} />
                  Version History
                </MenuItem> 
                <MenuSeparator />
              </>)}

              <MenuItem onAction={startImport}>
                <UploadIcon size={16} />
                Import Drive
              </MenuItem>
              <MenuItem onAction={doExport}>
                <DownloadIcon size={16} />
                Export Drive
              </MenuItem>
              <MenuItem onAction={doExportJson}>
                <DownloadIcon size={16} />
                Export Drive to JSON
              </MenuItem>

              <MenuSeparator />

              <MenuItem
                onAction={() => {
                  $settingsStore.setKey("show", true);
                }}
              >
                <Settings size={16} />
                Settings
              </MenuItem>

              <MenuItem
                onAction={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="flex items-center"
              >
                {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
                Change Theme
              </MenuItem>
            </Menu>
          </MenuPopover>
        </MenuTrigger>
      </NavbarContent>
    </Navbar>
  );
}
