import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import { ThemeSwitch } from "../../lab/nextui/ThemeSwitch.tsx";
import { CreateDocumentDialogButton } from "./CreateDocumentDialogButton.tsx";

export function DriveAppActions() {
  return (
    <Navbar
      className="bg-transparent"
      classNames={{
        wrapper: "border-b",
      }}
    >
      <NavbarContent className="gap-4" justify="center">
        <NavbarItem>Saved Documents</NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <CreateDocumentDialogButton />
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
