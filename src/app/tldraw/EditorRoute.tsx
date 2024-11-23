
import { useEditorRoute } from "../shared/useEditorRoute";
import Editor from "./Tldraw";

export function EditorRoute() {
  useEditorRoute()
  return <Editor className="h-screen" />;
}
