import { Card } from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { DeleteSavedDialog } from "../shared/DeleteSavedDialog.tsx";
import { $docMetas } from "../shared/store/local-docs-metadata.ts";
import { typeIconMap } from "../shared/typeIconMap.tsx";
import { EmptyState, getDocUrl as getAppDocUrl } from "./Drive.tsx";
import { cn } from "@/lib/utils.ts";
import { Loading } from "@/components/ui/loading.js";

export default function DriveListing({ getDocUrl = getAppDocUrl, className }: { getDocUrl?: (name: string, type: string) => string | undefined; className?: string; }) {
  const allDocMetas = useStore($docMetas);
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
    return <Loading />;
  }
  if (documents.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className={cn("w-full max-w-3xl mx-auto  flex-1 flex flex-col gap-2 p-2", className)}>
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
