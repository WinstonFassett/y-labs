import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext, useEffect, useRef } from 'react';
import './BlockSuiteAppEditor.css';
import { Doc, Schema } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';
import '@blocksuite/presets/themes/affine.css';

function App() {
  return (
    <EditorProvider>
      <div className="app">
        {/* <Sidebar /> */}
        <div className="main-content">
          {/* <TopBar /> */}
          <EditorContainer />
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;


export const EditorContext = createContext<{
  editor: AffineEditorContainer;
  collection: DocCollection;
} | null>(null);

export function useEditor() {
  return useContext(EditorContext);
}



export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const { editor, collection } = initEditor();

  return (
    <EditorContext.Provider value={{ editor, collection }}>
      {children}
    </EditorContext.Provider>
  );
};


export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function initEditor() {
  const schema = new Schema().register(AffineSchemas);
  const collection = new DocCollection({ schema });
  collection.meta.initialize();

  const doc = collection.createDoc({ id: 'page1' });
  doc.load(() => {
    const pageBlockId = doc.addBlock('affine:page', {});
    doc.addBlock('affine:surface', {}, pageBlockId);
    const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    doc.addBlock('affine:paragraph', {}, noteId);
  });

  const editor = new AffineEditorContainer();
  editor.doc = doc;
  editor.slots.docLinkClicked.on(({ docId }) => {
    const target = collection.getDoc(docId);
    editor.doc = target!;
  });
  editor.switchEditor('edgeless');
  return { editor, collection };
}

const EditorContainer = () => {
  const { editor } = useEditor()!;

  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorContainerRef.current && editor) {
      editorContainerRef.current.innerHTML = '';
      editorContainerRef.current.appendChild(editor);
    }
  }, [editor]);

  return <div className="editor-container" ref={editorContainerRef}></div>
};