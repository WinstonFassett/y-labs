import { AffineEditorContainer, EdgelessEditor, createEmptyDoc, } from '@blocksuite/presets';
import { Doc } from '@blocksuite/store';
import { DocCollection } from '@blocksuite/store';
// import '@blocksuite/presets/themes/affine.css';
import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { collection } from '@/app/shared/store/blocksuite-docs';

import '@toeverything/theme/style.css'

blocksEffects();
presetsEffects();

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function initEditor(doc: Doc) {
  console.log('initEditor')

  doc.load(() => {
    // const pageBlockId = doc.addBlock('affine:page', {});
    // doc.addBlock('affine:surface', {}, pageBlockId);
    // const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    // doc.addBlock('affine:paragraph', {}, noteId);
  });

  const editor = new EdgelessEditor();
  // const editor = new AffineEditorContainer();
  // const doc2 = createEmptyDoc().init();
  editor.doc = doc;
  // editor.slots.docLinkClicked.on(({ docId }) => {
  //   const target = <Doc>collection.getDoc(docId);
  //   editor.doc = target;
  // });
  return { editor, collection };
}
