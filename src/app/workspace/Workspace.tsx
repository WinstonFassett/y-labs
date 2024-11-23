import { AppSidebar } from "@/components/app-sidebar"
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
