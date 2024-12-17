
import AppBar from "../shared/AppBar";
import { useDocEditor } from "../shared/useDocEditor";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./playground";

export function EditorRoute() {
  useDocRoomRoute()
  const { currentDoc, docEditorKey, provider } = useDocEditor();
  console.log({ currentDoc, provider, docEditorKey })
  return <div className="flex-1 flex flex-col">
    <AppBar />
    <Editor key={docEditorKey} doc={currentDoc} awareness={provider?.awareness} />    
  </div>;
}
