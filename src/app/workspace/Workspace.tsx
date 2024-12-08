import { AppSidebar } from "@/app/workspace/WorkspaceSidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import AppBar from "./WorkspaceAppBar"
import Editor from "./Editor"
import { CreateDocumentDialog } from "./CreateDocumentDialog"
import { Toaster } from "@/components/ui/toaster"


export function Workspace() {
  return (
    <SidebarProvider shortcut="l">
      <AppSidebar />
      <SidebarInset>
        <AppBar />        
        <Editor />
        <CreateDocumentDialog />
        <Toaster /> 
      </SidebarInset>
    </SidebarProvider>
  )
}
