import { ChevronRight, File, FilePlusIcon, Folder } from "lucide-react"
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail
} from "@/components/ui/sidebar"
import { useStore } from "@nanostores/react"
import { Button } from "../../components/ui/button"
import logoRaw from "../../images/lab-icon.svg?raw"
import { typeIconMap } from "../shared/typeIconMap"
import { createDocumentState } from "./CreateDocumentDialog"
import { EditorsByType } from "./Editor"
import { $docMetas } from "../shared/store/doc-metadata"


const ValidTypes = Object.keys(EditorsByType).filter(t => t !== 'UNKNOWN');

function getDocUrl(name: string, type: string) {
  return `/y-labs/app/workspace/index.html#/edit/${name}/${type}`;  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const allDocMetas = useStore($docMetas);

  const docMetasSorted = React.useMemo(() => {
    if (!allDocMetas) return undefined;
    // console.log('sorting', allDocMetas)
    const sorted = allDocMetas.filter(m => ValidTypes.includes(m.type));
    sorted.sort((a, b) => {
      // sort by most recent, then by title
      if (a.savedAt > b.savedAt) return -1;
      if (a.savedAt < b.savedAt) return 1;
      return (a.title ?? "").localeCompare(b.title ?? "");      
    })
    return sorted
  }, [allDocMetas]);

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
        <Button size="icon" variant="default" className="ml-auto" onClick={createDocumentState.open}>
          <FilePlusIcon />
        </Button>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              { !docMetasSorted ? <div>Loading...</div> :
               docMetasSorted.map((doc, index) => {
                const filename = `${doc.title || "[Untitled]"}` //.${doc.type}`
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <a key={doc.id} title={filename} href={getDocUrl(doc.id, doc.type)}>
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
