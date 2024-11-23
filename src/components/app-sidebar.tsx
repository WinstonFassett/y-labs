import * as React from "react"
import { ChevronRight, File, Folder, HardDriveIcon } from "lucide-react"

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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import { documentsStore } from "@/app/drive/store"
import { useStore } from "@nanostores/react"
import { Button } from "./ui/button"

function getDocUrl(name: string, type: string) {
  return `/y-labs/app/workspace/index.html#/edit/${name}`;  
}

// This is sample data.
const data = {
  changes: [
    {
      file: "README.md",
      state: "M",
    },
    {
      file: "api/hello/route.ts",
      state: "U",
    },
    {
      file: "app/layout.tsx",
      state: "M",
    },
  ],
  tree: [
    // [
    //   "app",
    //   [
    //     "api",
    //     ["hello", ["route.ts"]],
    //     "page.tsx",
    //     "layout.tsx",
    //     ["blog", ["page.tsx"]],
    //   ],
    // ],
    // [
    //   "components",
    //   ["ui", "button.tsx", "card.tsx"],
    //   "header.tsx",
    //   "footer.tsx",
    // ],
    // ["lib", ["util.ts"]],
    // ["public", "favicon.ico", "vercel.svg"],
    // ".eslintrc.json",
    // ".gitignore",
    // "next.config.js",
    // "tailwind.config.js",
    // "package.json",
    // "README.md",
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const documents = useStore(documentsStore);
  if (!documents) {
    return <div>Loading...</div>;
  }
  if (documents.length === 0) {
    return "No documents found";
  }
  return (
    <Sidebar {...props}>
      <SidebarContent>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.changes.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>
                    <File />
                    {item.file}
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
        <SidebarGroup className="items-start">
          <Button
            asChild
            title="Saved Documents"
            variant="ghost"
            className="block flex items-center"
          >
            <a href="/y-labs/index.html">
              <HardDriveIcon className="h-5 w-5" />
            </a>
          </Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {documents.map((doc, index) => {
                
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <a key={doc.name} href={getDocUrl(doc.name, doc.type)}>
                        <File />
                        {doc.title || "[Untitled]"}.{doc.type}
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
