import { useDocEditor } from "../shared/useDocEditor";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Milkdown from "./playground";

export default function MilkdownEditor() {
  useDocRoomRoute();
  const { currentDoc, docEditorKey, provider } = useDocEditor();
  console.log({ currentDoc, provider, docEditorKey });
  return (
    <Milkdown
      key={docEditorKey}
      doc={currentDoc}
      awareness={provider?.awareness}
    />
  );
}
