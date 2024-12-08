import { AppSidebar } from "@/app/workspace/WorkspaceSidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useNavigate } from "react-router-dom"
import { VersionHistory } from "../shared/VersionHistory"
import { CreateDocumentDialog } from "./CreateDocumentDialog"
import Editor from "./Editor"
import AppBar from "./WorkspaceAppBar"
import { Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVersionHistory } from "../shared/useVersionHistory"


export function Workspace() {
  const navigate = useNavigate();
  // const { docId, type } = useParams<{ docId: string, type: string }>();
  const { showVersionHistory, setShowVersionHistory } = useVersionHistory()

  return (
    <SidebarProvider shortcut="l">
      <AppSidebar />
      <SidebarInset>
        <AppBar />        
        <Editor />
        <CreateDocumentDialog />
        <Toaster /> 
      </SidebarInset>
      <div>
        <SidebarProvider shortcut="r" open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <div className="flex items-end absolute z-50 -left-7 border h-24 border-red-400">            
          </div>

          <Sidebar side="right" className="border-l-transparent">
            <SidebarContent className="p-2">

              <div className="shrink-0 flex items-center gap-2 border-b">
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
      {/*  */}
    </SidebarProvider>
  )
}
