import { AriaButton } from "@/components/ui/aria-button";
import { Menu, MenuItem, MenuPopover, MenuSeparator, MenuTrigger } from "@/components/ui/aria-menu";
import { useTheme } from "@/lib/astro-tailwind-themes/useTheme";
import {
  DownloadIcon,
  FileText,
  Moon,
  MoreVertical,
  Sun,
  UploadIcon,
} from "lucide-react";
import {
  createDocumentState
} from "./CreateDocumentDialogButton";
import { doExport, doExportJson } from "./ExportDriveButton";
import { startImport } from "./ImportDrive";

export function DriveActions() {
  const [theme, setTheme] = useTheme();
  return (
    <MenuTrigger>
      <AriaButton aria-label="Menu" size="icon" variant="outline" className="rounded-full">
        <MoreVertical size={20} />
      </AriaButton>
      <MenuPopover>
        <Menu>
          <MenuItem onAction={() => {
            createDocumentState.open();
          }}>
            <FileText size={16} />
            New document
          </MenuItem>
          <MenuSeparator />
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
              setTheme(theme === "dark" ? "light" : "dark");
            }}
          >
            {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
            Change Theme
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}
