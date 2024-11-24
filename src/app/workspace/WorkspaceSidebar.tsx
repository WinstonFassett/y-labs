import { ChevronRight, File, Folder, HardDriveIcon, PlusIcon } from "lucide-react"
import * as React from "react"

import { documentsStore } from "@/app/drive/store"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail
} from "@/components/ui/sidebar"
import { useStore } from "@nanostores/react"
import { Button } from "../../components/ui/button"
import logoRaw from  "../../images/lab-icon.svg?raw";
import { createDocumentState } from "./CreateDocumentDialog"
import { typeIconMap } from "../shared/typeIconMap"
import { EditorsByType } from "./Editor"


const ValidTypes = Object.keys(EditorsByType).filter(t => t !== 'UNKNOWN');

function getDocUrl(name: string, type: string) {
  return `/y-labs/app/workspace/index.html#/edit/${name}/${type}`;  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const allDocuments = useStore(documentsStore);
  const documents = allDocuments?.filter(doc => ValidTypes.includes(doc.type));
  if (!documents) {
    return <div>Loading...</div>;
  }
  if (documents.length === 0) {
    return "No documents found";
  }
  return (
    <Sidebar {...props}>
      <SidebarContent>
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
          <PlusIcon />
        </Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {documents.map((doc, index) => {
                const filename = `${doc.title || "[Untitled]"}` //.${doc.type}`
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <a key={doc.name} title={filename} href={getDocUrl(doc.name, doc.type)}>
                        {typeIconMap[doc.type as keyof typeof typeIconMap] ?? typeIconMap["unknown"]}
                        <span className="text-nowrap text-ellipsis">
                          {filename}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
    </Sidebar>
  )
}

function Tree({ item }: { item: string | any[] }) {
  const [name, ...items] = Array.isArray(item) ? item : [item]

  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={name === "button.tsx"}
        className="data-[active=true]:bg-transparent"
      >
        <File />
        {name}
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
