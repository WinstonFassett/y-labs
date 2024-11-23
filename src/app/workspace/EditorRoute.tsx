
import { useEditorRoute } from "../shared/useEditorRoute";
import { Workspace } from "./Workspace";

export function EditorRoute() {
  useEditorRoute()
  // return <Editor className="h-full" />;
  return <Workspace />
}
