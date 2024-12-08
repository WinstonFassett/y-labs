
import type DriveListing from "@/app/drive/DriveListing";
import { Suspense, lazy, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { useStoreIfPresent } from "../shared/useStoreIfPresent";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { VersionHistory } from "../shared/VersionHistory";
import { useDocEditorMode } from "../shared/useDocEditorMode";

export const EditorsByType: Record<string, React.ComponentType<{ className?: string }>>
 = {
  novel: lazy(() => import("./NovelEditor")),
  tldraw: lazy(() => import("@/app/tldraw/TlDrawEditor")),
  // codemirror: lazy(() => import("@/app/codemirror/Codemirror")),
  blocknote: lazy(() => import("@/app/blocknote/Blocknote")),
  drive: lazy(() => import("@/app/drive/DriveListing")),
  UNKNOWN: UnknownEditorType,
}

export function Editor({ className }: { className?: string }) {
  const { docId, type } = useParams<{ docId: string, type: string }>();
  const { needsPasswordToConnect, roomId } = useDocCollabStore(false)
  const loadState = useStoreIfPresent(roomId ? getDocLoadState(docId!, roomId) : undefined);
  if (!docId) return <FolderView />;
  const canShow = !needsPasswordToConnect || loadState === "loaded";
  const EditorComponent = (type && EditorsByType[type]) || EditorsByType.UNKNOWN;
  const location = useLocation();
  const mode = useDocEditorMode() 
  const showVersionHistory = !!docId && mode === 'versions';  
  // const [showVersionHistory, setShowVersionHistory] = useState(true);
  const navigate = useNavigate();
  return (<>
    <Suspense fallback={<div>Loading...</div>}>
      {!canShow ? <div>Loading...</div> : 
      
      // <div className="flex flex-row">
      //   <EditorComponent key={docId} className={className} />
      //   <div>sidebar</div>
        
      // </div>
        <main className="">
          <SidebarProvider shortcut="r" open={showVersionHistory} onOpenChange={() => {
            navigate({
              pathname: showVersionHistory
                ? `/edit/${docId}/${type}`
                : `/versions/${docId}/${type}`,
              search: location.search,
            });
          }}>
          <EditorComponent key={docId} className={className} />
            <Sidebar side="right" className="pt-14 border-l-transparent">
              <SidebarContent className="p-2">
                <SidebarTrigger className="absolute -left-7"/>
                {!!showVersionHistory && <VersionHistory />}
              </SidebarContent>
            </Sidebar>
              
          </SidebarProvider>
        </main>
      }    
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
      <Suspense fallback="Loading...">
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

