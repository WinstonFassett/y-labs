import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils.js";
import { useStore } from "@nanostores/react";
import { CreateDocumentDialog } from "./CreateDocumentDialogButton.tsx";
import { ImportDriveModal } from "./ImportDrive.tsx";
import { documentsStore } from "./store.ts";
import { typeIconMap } from "../shared/typeIconMap.tsx";

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

function getDocUrl(name: string, type: string) {
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
const EmptyState = () => (
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

function DriveListing() {
  const documents = useStore(documentsStore);
  if (!documents) {
    return <div>Loading...</div>;
  }
  if (documents.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="w-full max-w-3xl mx-auto  flex-1 flex flex-col gap-2 p-2">
      {documents.map((doc, index) => {
        const url = getDocUrl(doc.name, doc.type);
        if (!url) return null;
        return (
          <a key={doc.name} href={getDocUrl(doc.name, doc.type)}>
            <Card className="transition-all text-foreground box-border shadow-medium rounded-small hover:bg-secondary cursor-pointer  active:scale-[0.97]">
              <div className="w-full flex items-center p-4 gap-4">
                <div className="flex-1 flex items-center gap-2">
                  {typeIconMap[doc.type as keyof typeof typeIconMap] ?? typeIconMap["unknown"]}
                  <div className="text-sm font-semibold flex-1">
                    {doc.title || "[Untitled]"}
                  </div>
                  <div className="text-sm text-default-500">{doc.type}</div>
                </div>
                {/* <Tooltip content="Delete document" color="danger">
                <Button
                  color="danger"
                  size="sm"
                  variant="light"
                  isIconOnly
                  className="rounded-full"
                >
                  <TrashIcon size={"16"} />
                </Button>
              </Tooltip> */}
              </div>
            </Card>
          </a>
        );
      })}
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
    </div>
  );
}

export default Drive;
