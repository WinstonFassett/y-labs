import { AppSidebar } from "@/app/workspace/WorkspaceSidebar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Clock, X } from "lucide-react"
import { VersionHistory } from "../shared/VersionHistory"
import { useVersionHistory } from "../shared/useVersionHistory"
import { CreateDocumentDialog } from "./CreateDocumentDialog"
import Editor from "./Editor"
import AppBar from "./WorkspaceAppBar"
import { TimelineControls } from "../shared/PlaybackControls"
import { useStore } from "@nanostores/react"
import { usePlayback } from "../shared/usePlayback"
import { useCallback, useMemo } from "react"

export function Workspace() {
  const { showVersionHistory, setShowVersionHistory } = useVersionHistory()
  return (
    <SidebarProvider shortcut="l" className="h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppBar />
        <div className="flex-1 overflow-auto flex flex-col">
          <Editor />
          <footer className="bg-white dark:bg-black border-t py-2 sm:py-4 shrink-0 sticky bottom-0">
            <VersionTimelineControls />
          </footer>
        </div>
        <CreateDocumentDialog />
        <Toaster /> 
      </SidebarInset>
      <div>
        <SidebarProvider shortcut="r" open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <Sidebar side="right" className="border-l-transparent z-50">
            <SidebarContent className="p-2">

              <div className="shrink-0 flex items-center gap-2 border-b h-12">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h2 className="flex-1 py-2">Version History</h2>
                <Button variant="ghost"  className="rounded-full h-8 w-8" onClick={() => { setShowVersionHistory(false) }}>
                  <X className="h-2 w-2" />
                </Button>                
              </div>

              {!!showVersionHistory && 
                <VersionHistory />
              }

            </SidebarContent>
            <SidebarRail />
          </Sidebar>            
        </SidebarProvider>
      </div>
    </SidebarProvider>
  )
}


function VersionTimelineControls () {
  const { $versionHistory, displayVersionId, currentVersionId } = useVersionHistory()
  const versionGraph = useStore($versionHistory.$versionGraph)
  const versions = useStore($versionHistory.$versions)

  const handleJumpToVersion = useCallback(
    (versionId: string | null) => {
      if (!versionGraph?.nodes.has(versionId)) return;
      const version = versionGraph.nodes.get(versionId);
      if (!version) {
        console.warn("Version not found", versionId);
        return;
      } 
      $versionHistory.switchToVersion(versionId)
    },
    [versionGraph]
  );

  const {
    isPlaying,
    togglePlayback,
    stopPlayback
  } = usePlayback(
    versionGraph,
    currentVersionId,
    newVersion => $versionHistory.switchToVersion(newVersion)
  );

  const currentIndex = useMemo(() => {
    if (!versions) return 0;
    return versions.findIndex(v => v.id === currentVersionId);
  }, [currentVersionId, versionGraph])

  return (
      <TimelineControls
      onJumpToSnapshot={(index) => {
        const versions = Array.from(versionGraph?.nodes.values() || []);
        const version = versions[index]
        if (!version) return;        
        handleJumpToVersion(version.id);
      }}
      isPlaying={isPlaying}
      onPlayPause={togglePlayback}
      currentIndex={currentIndex}
      totalVersions={versionGraph?.nodes.size || 0}
    />
  )
}

