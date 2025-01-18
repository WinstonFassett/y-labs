import { ChevronRight, File, FilePlusIcon, Files, Folder, MoreHorizontal, TrashIcon } from "lucide-react"
import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { useStore } from "@nanostores/react"
import { AlertDialog } from "@radix-ui/react-alert-dialog"
import { Button } from "../../components/ui/button"
import logoRaw from "../../images/lab-icon.svg?raw"
import { DeleteSavedDialogAlertContent } from "../shared/DeleteSavedDialog"
import { $docMetas, type DocMetadata } from "../shared/store/local-docs-metadata"
import { FileTypeIcons, typeIconMap } from "../shared/typeIconMap"
import { createDocumentState } from "./CreateDocumentDialog"
import { EditorsByType } from "./Editor"
import { Skeleton } from "@/components/ui/skeleton"


const ValidTypes = Object.keys(EditorsByType).filter(t => t !== 'UNKNOWN');

function getDocUrl(name: string, type: string) {
  return `/y-labs/app/workspace/index.html#/edit/${name}/${type}`;  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [pendingDeleteItem, setPendingDeleteItem] = React.useState<DocMetadata | null>(null)
  const allDocMetas = useStore($docMetas);

  const docMetasSorted = React.useMemo(() => {
    if (!allDocMetas) return undefined;
    const sorted = allDocMetas.filter(m => ValidTypes.includes(m.type));
    sorted.sort((a, b) => {
      // sort by most recent, then by title
      if (a.savedAt > b.savedAt) return -1;
      if (a.savedAt < b.savedAt) return 1;
      return (a.title ?? "").localeCompare(b.title ?? "");      
    })
    return sorted
  }, [allDocMetas]);
  const sidebarState = useSidebar()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarGroup className="flex flex-row">
        <Button
          asChild
          title="Y-Labs"
          variant="ghost"
          size="icon"
          className="[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0"
        >
          <a href="/y-labs/index.html" className="block" dangerouslySetInnerHTML={{ __html: logoRaw }}>
          </a>
        </Button>
        <Button size="icon" variant="ghost" className="ml-auto" onClick={createDocumentState.open}>
          <FilePlusIcon />
        </Button>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>

          <SidebarGroupContent>
            
            <SidebarMenu>
              { !sidebarState.open || !docMetasSorted ? <FilesSkeleton /> :              
               docMetasSorted.map((doc, index) => {
                const filename = `${doc.title || "[Untitled]"}` //.${doc.type}`
                const FileIcon = FileTypeIcons[doc.type as keyof typeof typeIconMap] ?? FileTypeIcons["unknown"]
                return (
                  <DropdownMenu key={doc.id}>
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <a key={doc.id} className="flex-1 flex flex-row gap-2 items-center overflow-hidden" title={filename} href={getDocUrl(doc.id, doc.type)}>
                          
                          <FileIcon className="h-5 w-5" />
                          <div className="flex-1 text-nowrap overflow-hidden">
                            {filename}
                          </div>

                          <DropdownMenuTrigger asChild>
                            <div>
                            <SidebarMenuButton size="sm" className="text-muted-foreground rounded-xl p-0 h-6 w-6 flex items-center justify-center hover:bg-sidebar hover:text-foreground">
                              <MoreHorizontal className="" />
                            </SidebarMenuButton>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent                       
                            side="right"
                            align="start"
                            className="min-w-56 rounded-lg">
                            <DropdownMenuItem onClick={() => {
                              setPendingDeleteItem(doc)
                            }}>
                              <TrashIcon className="h-5 w-5 text-destructive" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>

                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </DropdownMenu>
                )
              })}
              {/* {data.tree.map((item, index) => (
                <Tree key={index} item={item} />
              ))} */}
            </SidebarMenu>            

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <AlertDialog open={!!pendingDeleteItem} onOpenChange={open => {
        if (!open) {
          setPendingDeleteItem(null)
        }
      }}>
        <DeleteSavedDialogAlertContent {...(pendingDeleteItem!)} />
      </AlertDialog>
    </Sidebar>
  )
}

function FilesSkeleton () {
  return (
    <div className="overflow-hidden">
      <SidebarMenuSkeleton />
      <SidebarMenuSkeleton />
      <SidebarMenuSkeleton />
      <SidebarMenuSkeleton />
      <SidebarMenuSkeleton />
    </div>
  )
}

// function Tree({ item }: { item: string | any[] }) {
//   const [name, ...items] = Array.isArray(item) ? item : [item]

//   if (!items.length) {
//     return (
//       <SidebarMenuButton
//         isActive={name === "button.tsx"}
//         className="data-[active=true]:bg-transparent"
//       >
//         <File />
//         {name}
//       </SidebarMenuButton>
//     )
//   }

//   return (
//     <SidebarMenuItem>
//       <Collapsible
//         className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
//         defaultOpen={name === "components" || name === "ui"}
//       >
//         <CollapsibleTrigger asChild>
//           <SidebarMenuButton>
//             <ChevronRight className="transition-transform" />
//             <Folder />
//             {name}
//           </SidebarMenuButton>
//         </CollapsibleTrigger>
//         <CollapsibleContent>
//           <SidebarMenuSub>
//             {items.map((subItem, index) => (
//               <Tree key={index} item={subItem} />
//             ))}
//           </SidebarMenuSub>
//         </CollapsibleContent>
//       </Collapsible>
//     </SidebarMenuItem>
//   )
// }
