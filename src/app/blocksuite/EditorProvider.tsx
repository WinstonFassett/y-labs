import { AffineEditorContainer } from "@blocksuite/presets";
import { DocCollection } from "@blocksuite/store";
import { EditorContext } from "./context";

export const EditorProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    editor: AffineEditorContainer;
    collection: DocCollection;
  };
}) => {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
};
