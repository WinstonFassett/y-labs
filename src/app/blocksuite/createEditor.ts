import { AffineEditorContainer, EdgelessEditor, createEmptyDoc, } from '@blocksuite/presets';
import { Doc } from '@blocksuite/store';
import { DocCollection } from '@blocksuite/store';
// import '@blocksuite/presets/themes/affine.css';
// import { effects as blocksEffects } from '@blocksuite/blocks/effects';
// import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { collection } from '@/app/shared/store/blocksuite-docs';

// import '@toeverything/theme/style.css'
import '@blocksuite/presets/themes/affine.css';


// blocksEffects();
// presetsEffects();

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function createEditor(doc: Doc) {
  console.log('createEditor', doc)

  doc.load(() => {
    console.log('setting up NEW blocksuite doc', doc)
    if (doc.isEmpty) {
      const pageBlockId = doc.addBlock('affine:page', {});
      doc.addBlock('affine:surface', {}, pageBlockId);
      // const noteId = doc.addBlock('affine:note', {}, pageBlockId);
      // doc.addBlock('affine:paragraph', {}, noteId);
    }
      
  });

  // const editor = new EdgelessEditor();
  const editor = new AffineEditorContainer();
  editor.switchEditor('edgeless')
  
  // const doc2 = createEmptyDoc().init();
  editor.doc = doc;
  // editor.slots.docLinkClicked.on(({ docId }) => {
  //   const target = <Doc>collection.getDoc(docId);
  //   editor.doc = target;
  // });
  return { editor, collection };
}
