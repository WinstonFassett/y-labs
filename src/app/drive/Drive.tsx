import { useStore } from "@nanostores/react";
import { Card, CardBody, CardFooter, cn } from "@nextui-org/react";
import { FileQuestionIcon } from "lucide-react";
import { documentsStore } from "./store.ts";

const typeIconMap = {
  codemirror: (
    <img src="/logos/codemirror.svg" alt="CodeMirror" className="h-8 w-8" />
  ),
  blocknote: (
    <img src="/logos/blocknote.svg" alt="Blocknote" className="h-8 w-8" />
  ),
  novel: <img src="/logos/novel.svg" alt="Novel" className="h-8 w-8" />,
  tldraw: (
    <img src="/logos/tldraw.svg" alt="TL Tldraw Meta" className="h-8 w-8" />
  ),
  unknown: <FileQuestionIcon className="h-8 w-8" />,
};

const docTypes = [
  {
    label: "Novel",
    icon: typeIconMap.novel,
    href: "/app/novel/index.html#/new",
  },
  {
    label: "Tldraw",
    icon: typeIconMap.tldraw,
    href: "/app/tldraw/index.html#/new",
  },
  {
    label: "Blocknote",
    icon: typeIconMap.blocknote,
    href: "/app/blocknote/index.html#/new",
  },
  {
    label: "Codemirror",
    icon: typeIconMap.codemirror,
    href: "/app/codemirror/index.html#/new",
  },
];

function getDocUrl(name: string, type: string) {
  switch (type) {
    case "novel":
      return `/app/novel/index.html#/edit/${name}`;
    case "blocknote":
      return `/app/blocknote/index.html#/edit/${name}`;
    case "codemirror":
      return `/app/codemirror/index.html#/edit/${name}`;
    case "tldraw":
      return `/app/tldraw/index.html#/edit/${name}`;
    default:
      return null;
  }
}
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
    <h2 className="text-default-400 mb-32">No Documents Found</h2>
    <CreateDocButtons />
  </div>
);

export function CreateDocButtons() {
  return (
    <div>
      <p className="text-default-600 text-center">Create a new document:</p>
      <div className="gap-2 grid grid-cols-2 justify-items-center items-center mt-8">
        {docTypes.map((docType) => (
          <Card
            key={docType.href}
            isPressable
            isHoverable
            as="a"
            href={docType.href}
            classNames={{
              base: "w-24 h-24 flex flex-col items-center justify-center", // Adjust width and height as necessary
              body: "flex items-center justify-center flex-grow",
            }}
          >
            <CardBody>{docType.icon}</CardBody>
            <CardFooter className="pt-0 text-xs flex justify-center">
              {docType.label}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DriveListing({ className }: { className?: string }) {
  const documents = useStore(documentsStore);
  if (documents.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="flex-1 flex flex-col gap-2 p-2">
      {documents.map((doc, index) => {
        const url = getDocUrl(doc.name, doc.type);
        if (!url) return null;
        return (
          <Card
            as="a"
            isPressable
            isHoverable
            key={index}
            radius="sm"
            href={getDocUrl(doc.name, doc.type)}
          >
            <div className="w-full flex items-center p-4 gap-4">
              <div className="flex-1 flex items-center gap-2">
                {typeIconMap[doc.type] ?? typeIconMap["unknown"]}
                <div className="text-sm font-semibold">
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
        );
      })}
    </div>
  );
}

function Drive({ className }: { className: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className={cn("w-full flex-1 mx-auto relative")}>
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          <DriveListing />
        </div>
      </div>
    </div>
  );
}

export default Drive;
