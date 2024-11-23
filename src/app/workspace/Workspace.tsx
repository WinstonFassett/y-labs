import { AppSidebar } from "@/components/app-sidebar";

export function Workspace({}: {}) {
  return <AppSidebar />;
}

function FileExplorer({}: {}) {
  return <div className="">File Explorer</div>;
}

function FileEditor({}: {}) {
  return <div className="h-full w-full bg-content1">File Editor</div>;
}
