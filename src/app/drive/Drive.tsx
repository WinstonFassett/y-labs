import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils.js";
import { CreateDocumentDialog } from "./CreateDocumentDialogButton.tsx";
import { ImportDriveModal } from "./ImportDrive.tsx";
import { documentsStore } from "./store.ts";
import { typeIconMap } from "../shared/typeIconMap.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TrashIcon } from "lucide-react";
import DriveListing from "./DriveListing.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";


const docTypes = [
  {
    label: "Novel",
    icon: typeIconMap.novel,
    href: "/y-labs/app/novel/index.html#/new",
  },
  {
    label: "Tldraw",
    icon: typeIconMap.tldraw,
    href: "/y-labs/app/tldraw/index.html#/new",
  },
  {
    label: "Blocknote",
    icon: typeIconMap.blocknote,
    href: "/y-labs/app/blocknote/index.html#/new",
  },
  {
    label: "Codemirror",
    icon: typeIconMap.codemirror,
    href: "/y-labs/app/codemirror/index.html#/new",
  },
];

export function getDocUrl(name: string, type: string) {
  switch (type) {
    case "novel":
      return `/y-labs/app/novel/index.html#/edit/${name}`;
    case "blocknote":
      return `/y-labs/app/blocknote/index.html#/edit/${name}`;
    case "codemirror":
      return `/y-labs/app/codemirror/index.html#/edit/${name}`;
    case "tldraw":
      return `/y-labs/app/tldraw/index.html#/edit/${name}`;
    default:
      return undefined;
  }
}
export const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
    <h2 className="text-default-400 mb-32">No Documents Found</h2>
    <CreateDocButtons />
  </div>
);

export function CreateDocButtons() {
  const base = "w-24 h-24 flex flex-col items-center justify-center transition-all shadow-medium hover:bg-secondary cursor-pointer  active:scale-[0.97]"
  const body = "flex items-center justify-center flex-grow"
  return (
    <div>
      <p className="text-default-600 text-center">Create a new document:</p>
      <div className="gap-2 grid grid-cols-2 justify-items-center items-center mt-8">
        {docTypes.map((docType) => (
          <a href={docType.href}>
            <Card
              key={docType.href}
              // isPressable
              // isHoverable
              className={cn(base, body)}  
            >
                <CardHeader className="items-center">
                  {docType.icon}
                </CardHeader>
                <CardFooter className="text-sm">
                  {docType.label}
                </CardFooter>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

function Drive({ className }: { className?: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className={cn("w-full flex-1 mx-auto relative", className)}>
        <div className="h-full flex flex-col">
          <DriveListing />
        </div>
      </div>
      <CreateDocumentDialog />
      <ImportDriveModal />
      <Toaster />
    </div>
  );
}

export default Drive;
