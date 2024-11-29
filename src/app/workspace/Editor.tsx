
import { useParams } from "react-router-dom";
import { CreateDocButtons } from "./CreateDocMenu";
import { Suspense, lazy } from "react";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import type DriveListing from "@/app/drive/DriveListing";
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
  if (!docId) return <FolderView />;
  const { needsPasswordToConnect, ydoc } = useDocCollabStore(false)
  const canShow = !needsPasswordToConnect || (ydoc.isLoaded)
  const EditorComponent = (type && EditorsByType[type]) || EditorsByType.UNKNOWN;
  return (<>
    <Suspense fallback={<div>Loading...</div>}>    
      {canShow && <EditorComponent key={docId} className={className} />}    
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
      <h3>Recent Saved Files</h3>
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