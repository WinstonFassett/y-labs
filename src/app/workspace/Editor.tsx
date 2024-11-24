import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";
import { Workspace } from "./Workspace";
import NovelEditor from "./NovelEditor";
import { useParams, useSearchParams } from "react-router-dom";
import { CreateDocButtons } from "./CreateDocMenu";

export function Editor({ className }: { className?: string }) {
  const { docId } = useParams<{ docId: string }>();
  if (!docId) return <Empty />;
  return (
    <NovelEditor />
  );
}

export default Editor;


const Empty = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="text-center py-4">No documents saved.</div>
      <CreateDocButtons />
    </div>
  )
}