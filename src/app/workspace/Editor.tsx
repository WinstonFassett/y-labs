import type DriveListing from "@/app/drive/DriveListing";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Suspense, lazy, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { useDocEditorMode } from "../shared/useDocEditorMode";
import { useStoreIfPresent } from "../shared/useStoreIfPresent";

export const EditorsByType: Record<string, React.ComponentType<{ className?: string }>>
 = {
  novel: lazy(() => import("./NovelEditor")),
  tldraw: lazy(() => import("@/app/tldraw/TlDrawEditor")),
  codemirror: lazy(() => import("@/app/codemirror/Codemirror")),
  blocknote: lazy(() => import("@/app/blocknote/Blocknote")),
  blocksuite: lazy(() => import("@/app/blocksuite/BlocksuiteEditor")),
  milkdown: lazy(() => import("@/app/milkdown/Editor")),
  remirror: lazy(() => import("@/app/remirror/RemirrorEditor")),
  drive: lazy(() => import("@/app/drive/DriveListing")),
  UNKNOWN: UnknownEditorType,
}

export default function Editor({ className }: { className?: string }) {
  const { docId, type } = useParams<{ docId: string, type: string }>();
  const { needsPasswordToConnect, roomId } = useDocCollabStore(false)
  const loadState = useStoreIfPresent(roomId ? getDocLoadState(docId!, roomId) : undefined);
  const canShow = !needsPasswordToConnect || loadState === "loaded";
  const EditorComponent = (type && EditorsByType[type]) || EditorsByType.UNKNOWN;
  const location = useLocation();
  const mode = useDocEditorMode() 
  const showVersionHistory = !!docId && mode === 'versions';  
  const navigate = useNavigate();
  
  if (!docId) return <FolderView />;
  return (<>
    <Suspense fallback={<EditorSkeleton />}>
      {!canShow ? <EditorSkeleton /> : 
        <EditorComponent key={docId} className={className} />
      }    
    </Suspense>
    <PasswordRequiredDialog />
  </>
  );
}

function EditorSkeleton () {
  return <div className="w-full h-full flex flex-col gap-2 p-4 bg-muted">
    {/* <LineSkeleton className="h-12 mb-8" />
    <LineSkeleton className="h-10" />
    <LineSkeleton className="" />
    <LineSkeleton className="h-16" />
    <LineSkeleton className="" />
    <LineSkeleton className="h-32" /> */}
  </div>
}

function LineSkeleton ({ className, ...props }: { className?: string }) {
  // Random width between 50 to 90%.
  const style = useMemo(() => {
    if (className &&className.split(' ').find(it => it.indexOf('w-') === 0)) return {};
    return { width: `${  Math.floor(Math.random() * 40) + 50}%`}
  }, [className])
  return <Skeleton {...props} className={cn(`h-6 mt-4 mb-6`, className)} style={style} />
}

export function getDocUrl(name: string, type: string) {
  return `/y-labs/app/workspace/index.html#/edit/${name}/${type}`;
}

const FolderView = () => {
  const DriveListingComponent = EditorsByType.drive as typeof DriveListing;
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="w-full max-w-3xl mx-auto pl-4 pt-4">
        <h3 className="text-2xl text-muted-foreground">Recent Saved Files</h3>
      </div>
      <Suspense fallback="Loading files...">
        <DriveListingComponent getDocUrl={getDocUrl} />
      </Suspense>
    </div>
  )
}

function UnknownEditorType() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="text-center py-4">Unknown editor type.</div>
    </div>
  );
}

