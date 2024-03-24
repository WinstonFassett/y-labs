import { useTheme } from "@/lib/astro-tailwind-themes/useTheme";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  DownloadIcon,
  FileText,
  Moon,
  MoreVertical,
  Sun,
  UploadIcon,
} from "lucide-react";
import { CreateDocumentDialogButton } from "./CreateDocumentDialogButton";
import { doExport, doExportJson } from "./ExportDriveButton";
import { startImport } from "./ImportDrive";

export function DriveActions() {
  return (
    <div className="flex items-center">
      <CreateDocumentDialogButton />
      <MoreMenu />
    </div>
  );
}

function MoreMenu() {
  const [theme, setTheme] = useTheme();
  return (
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
        <DropdownItem
          key="import"
          onPress={startImport}
          endContent={<UploadIcon size={16} />}
        >
          Import Drive
        </DropdownItem>
        <DropdownItem
          key="export"
          onPress={doExport}
          endContent={<DownloadIcon size={16} />}
        >
          Export Drive
        </DropdownItem>
        <DropdownItem
          key="export-json"
          onPress={doExportJson}
          endContent={<DownloadIcon size={16} />}
        >
          Export Drive to JSON
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
