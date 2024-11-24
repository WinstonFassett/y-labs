
import { useEditorRoute } from "../shared/useEditorRoute";
import Editor from "./TlDrawEditorApp";

export function EditorRoute() {
  useEditorRoute()
  return <Editor className="h-screen" />;
}
