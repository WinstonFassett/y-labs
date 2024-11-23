
import { useEditorRoute } from "../shared/useEditorRoute";
import { Editor } from "./Editor";

export function EditorRoute() {
  useEditorRoute()
  return <Editor className="h-full" />;
}
