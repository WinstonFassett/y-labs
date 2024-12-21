import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { typeIconMap } from "../shared/typeIconMap";
import { cn } from "@/lib/utils";
import { createDocumentState } from "./CreateDocumentDialog";

const docTypes = [
  {
    label: "Novel",
    icon: typeIconMap.novel,
    href: "/y-labs/app/workspace/index.html#/new/novel",
  },
  {
    label: "Tldraw",
    icon: typeIconMap.tldraw,
    href: "/y-labs/app/workspace/index.html#/new/tldraw",
  },
  {
    label: "BlockSuite",
    icon: typeIconMap.blocksuite,
    href: "/y-labs/app/workspace/index.html#/new/blocksuite",
  },
  {
    label: "Milkdown",
    icon: typeIconMap.milkdown,
    href: "/y-labs/app/workspace/index.html#/new/milkdown",
  },
  {
    label: "Remirror",
    icon: typeIconMap.remirror,
    href: "/y-labs/app/workspace/index.html#/new/remirror",
  },
  {
    label: "Blocknote",
    icon: typeIconMap.blocknote,
    href: "/y-labs/app/workspace/index.html#/new/blocknote",
  },
  {
    label: "Codemirror",
    icon: typeIconMap.codemirror,
    href: "/y-labs/app/workspace/index.html#/new/codemirror",
  },
];


export function CreateDocButtons() {
  const base = "w-24 h-24 flex flex-col items-center justify-center transition-all shadow-medium hover:bg-secondary cursor-pointer  active:scale-[0.97]"
  const body = "flex items-center justify-center flex-grow"
  return (
    <div>
      <div className="gap-2 grid grid-cols-2 justify-items-center items-center mt-8">
        {docTypes.map((docType) => (
          <a href={docType.href} onClick={createDocumentState.close}>
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