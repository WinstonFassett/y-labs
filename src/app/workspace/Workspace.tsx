import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useDocCollabStore } from "../shared/useDocCollabStore"
import { useEditorRoute } from "../shared/useEditorRoute"
import Editor from "./Editor"
import AppBar from "../shared/AppBar"

export function Workspace() {
  // const 
  // const { 
  //   docId,
  //   ydoc,
  //   roomId,
  //   $roomConfig,
  //   $room
  // } = useDocCollabStore(false)
  // console.log(docId, ydoc, roomId, $roomConfig, $room)
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
