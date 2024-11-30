
import { useParams } from "react-router-dom";
import { CreateDocButtons } from "./CreateDocMenu";
import { Suspense, lazy } from "react";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import type DriveListing from "@/app/drive/DriveListing";
import { useStore } from "@nanostores/react";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useStoreIfPresent } from "../shared/useStoreIfPresent";
export const EditorsByType: Record<string, React.ComponentType>
 = {
  novel: lazy(() => import("./NovelEditor")),
  // tldraw: lazy(() => import("@/app/tldraw/TlDrawEditor")),
  codemirror: lazy(() => import("@/app/codemirror/Codemirror")),
  blocknote: lazy(() => import("@/app/blocknote/Blocknote")),
  drive: lazy(() => import("@/app/drive/DriveListing")),
  UNKNOWN: UnknownEditorType,
}

export function Editor({ className }: { className?: string }) {
  const { docId, type } = useParams<{ docId: string, type: string }>();
  const { needsPasswordToConnect, ydoc, roomId } = useDocCollabStore(false)
  const loadState = useStoreIfPresent(roomId ? getDocLoadState(docId!, roomId) : undefined);
  if (!docId) return <FolderView />;
  const canShow = !needsPasswordToConnect || loadState === "loaded";
  const EditorComponent = (type && EditorsByType[type]) || EditorsByType.UNKNOWN;
  return (<>
    <Suspense fallback={<div>Loading...</div>}>
      {!canShow ? <div>Loading...</div> : <EditorComponent key={docId} className={className} />}    
    </Suspense>
    <PasswordRequiredDialog />
  </>
  );
}

export default Editor;


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
      <Suspense fallback="Loading drive...">

        {/* <div className="text-center py-4">Folder view not implemented yet.</div> */}
        <DriveListingComponent getDocUrl={getDocUrl} />
      </Suspense>
    </div>
  )
}

const Empty = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="text-center py-4">No documents saved.</div>
      <CreateDocButtons />
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