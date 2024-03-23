import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { MoreVertical, FileText, Sun, Moon } from "lucide-react";
import { CreateDocumentDialogButton } from "./CreateDocumentDialogButton";
import { useTheme } from "@/lib/astro-tailwind-themes/useTheme";
import { ExportDriveButton } from "./ExportDriveButton";
import ImportDriveButton from "./ImportDriveButton";

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
        <DropdownItem key="export">
          <ExportDriveButton />
        </DropdownItem>
        <DropdownItem key="import">
          <ImportDriveButton />
        </DropdownItem>
        {/*
  <DropdownItem key="settings" endContent={<Settings size={16} />}>
    Settings
  </DropdownItem> */}
      </DropdownMenu>
    </Dropdown>
  );
}
