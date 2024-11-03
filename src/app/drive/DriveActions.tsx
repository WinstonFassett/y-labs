import { useTheme } from "@/lib/astro-tailwind-themes/useTheme";
// import {
//   Button,
//   Divider,
//   Dropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownTrigger,
// } from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DownloadIcon,
  FileText,
  Moon,
  MoreVertical,
  Sun,
  UploadIcon,
} from "lucide-react";
import {
  CreateDocumentDialogButton,
  createDocumentState,
} from "./CreateDocumentDialogButton";
import { doExport, doExportJson } from "./ExportDriveButton";
import { startImport } from "./ImportDrive";

export function DriveActions() {
  return (
    <div className="flex items-center">
      <MoreMenu />
    </div>
  );
}

function MoreMenu() {
  const [theme, setTheme] = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical size={20} />
        {/* <Button variant="light" isIconOnly>
        </Button> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        aria-label="More Actions"
        color="default"
        selectionMode="none"
      >
        <DropdownMenuItem
          onClick={() => {
            createDocumentState.open();
            console.log("opened");
          }}
          endContent={<FileText size={16} />}
        >
          New Document
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Divider />
        </DropdownMenuItem>
        <DropdownMenuItem
          key="import"
          onClick={startImport}
          endContent={<UploadIcon size={16} />}
        >
          Import Drive
        </DropdownMenuItem>
        <DropdownMenuItem
          key="export"
          onClick={doExport}
          endContent={<DownloadIcon size={16} />}
        >
          Export Drive
        </DropdownMenuItem>
        <DropdownMenuItem
          key="export-json"
          onClick={doExportJson}
          endContent={<DownloadIcon size={16} />}
        >
          Export Drive to JSON
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Divider />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Divider() {
  return <div className="border-t border-default-200 my-2" />;
}
