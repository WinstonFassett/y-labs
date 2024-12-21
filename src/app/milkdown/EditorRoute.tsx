
import AppBar from "../shared/AppBar";
import { useDocEditor } from "../shared/useDocEditor";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./playground";

export function EditorRoute() {
  useDocRoomRoute()
  const { currentDoc, docEditorKey, provider } = useDocEditor();
  return <>
    <AppBar />
    <Editor key={docEditorKey} doc={currentDoc} awareness={provider?.awareness} />    
  </>;
}
