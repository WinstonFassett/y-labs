import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";
import { Workspace } from "./Workspace";
import NovelEditor from "./NovelEditor";
import { useSearchParams } from "react-router-dom";

export function Editor({ className }: { className?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);
  return (
    <NovelEditor />
    // <div className={cn("flex flex-col", className)}>
    //   soooon
    // </div>
  );
}

export default Editor;
