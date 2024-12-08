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

export function Workspace() {
  const { showVersionHistory, setShowVersionHistory } = useVersionHistory()
  return (
    <SidebarProvider shortcut="l" className="h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppBar />
        <main className="flex-1 overflow-auto">
          <Editor />
        </main>
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
