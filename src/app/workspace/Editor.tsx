
import { useParams } from "react-router-dom";
import { CreateDocButtons } from "./CreateDocMenu";
import { Suspense, lazy } from "react";

export const EditorsByType: Record<string, React.ComponentType>
 = {
  novel: lazy(() => import("./NovelEditor")),
  // tldraw: lazy(() => import("@/app/tldraw/TlDrawEditor")),
  codemirror: lazy(() => import("@/app/codemirror/Codemirror")),
  blocknote: lazy(() => import("@/app/blocknote/Blocknote")),

  UNKNOWN: UnknownEditorType,
}

export function Editor({ className }: { className?: string }) {
  const { docId, type } = useParams<{ docId: string, type: string }>();
  if (!docId) return <Empty />;
  const EditorComponent = (type && EditorsByType[type]) || EditorsByType.UNKNOWN;
  return (<Suspense fallback={<div>Loading...</div>}>    
    <EditorComponent key={docId} className={className} />
  </Suspense>
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

function UnknownEditorType() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="text-center py-4">Unknown editor type.</div>
    </div>
  );
}