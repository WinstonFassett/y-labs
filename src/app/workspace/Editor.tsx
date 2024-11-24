import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";
import { Workspace } from "./Workspace";
import NovelEditor from "./NovelEditor";
import { useParams, useSearchParams } from "react-router-dom";

export function Editor({ className }: { className?: string }) {
  const { docId } = useParams<{ docId: string }>();
  console.log("docId", docId);
  if (!docId) return <Empty />;
  return (
    <NovelEditor />
    // <div className={cn("flex flex-col", className)}>
    //   soooon
    // </div>
  );
}

export default Editor;


const Empty = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  )
}