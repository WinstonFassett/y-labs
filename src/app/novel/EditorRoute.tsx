
import Editor from "./editor";
import { useEditorRoute } from "../shared/useEditorRoute";

export function EditorRoute() {
  useEditorRoute();
  return <Editor />;
}

