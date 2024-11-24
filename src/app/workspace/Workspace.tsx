import { AppSidebar } from "@/app/workspace/WorkspaceSidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import AppBar from "./WorkspaceAppBar"
import Editor from "./Editor"
import { CreateDocumentDialog } from "./CreateDocumentDialog"

export function Workspace() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppBar />        
        <Editor />
        <CreateDocumentDialog />
      </SidebarInset>
    </SidebarProvider>
  )
}
