import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast.ts";
import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { DeleteSavedDialog } from "../shared/DeleteSavedDialog.tsx";
import { $docMetas } from "../shared/store/doc-metadata.ts";
import { typeIconMap } from "../shared/typeIconMap.tsx";
import { EmptyState, getDocUrl } from "./Drive.tsx";

export default function DriveListing() {
  const allDocMetas = useStore($docMetas);
  const { toast } = useToast();
  const documents = useMemo(() => {
    if (!allDocMetas) return undefined;
    const sorted = [...allDocMetas];
    sorted.sort((a, b) => {
      // sort by most recent, then by title
      if (a.savedAt > b.savedAt) return -1;
      if (a.savedAt < b.savedAt) return 1;
      return (a.title ?? "").localeCompare(b.title ?? "");
    });
    return sorted;
  }, [allDocMetas]);

  if (!documents) {
    return <div>Loading...</div>;
  }
  if (documents.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="w-full max-w-3xl mx-auto  flex-1 flex flex-col gap-2 p-2">
      {documents.map((doc, index) => {
        const { id, title, type } = doc;
        const url = getDocUrl(id, type);
        if (!url) return null;
        return (
          <a key={id} href={getDocUrl(id, type)}>
            <Card className="transition-all text-foreground box-border shadow-medium rounded-small hover:bg-secondary cursor-pointer  active:scale-[0.97]">
              <div className="w-full flex items-center p-4 gap-4">
                <div className="flex-1 flex items-center gap-2">
                  {typeIconMap[type as keyof typeof typeIconMap] ?? typeIconMap["unknown"]}
                  <div className="text-sm font-semibold flex-1">
                    {title || "[Untitled]"}
                  </div>
                  <div className="text-sm text-default-500">{type}</div>
                </div>
                <DeleteSavedDialog {...doc} />
              </div>
            </Card>
          </a>
        );
      })}
    </div>
  );
}
