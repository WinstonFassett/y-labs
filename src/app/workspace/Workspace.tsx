import { AppSidebar } from "@/app/workspace/WorkspaceSidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import AppBar from "./WorkspaceAppBar"
import Editor from "./Editor"

export function Workspace() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppBar />        
        <Editor />
      </SidebarInset>
    </SidebarProvider>
  )
}
