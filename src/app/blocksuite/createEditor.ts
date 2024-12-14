import { collection } from '@/app/shared/store/blocksuite-docs';
import { AffineEditorContainer } from '@blocksuite/presets';
import { Doc, DocCollection } from '@blocksuite/store';

import '@blocksuite/presets/themes/affine.css';

// blocksEffects();
// presetsEffects();

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function createEditor(doc: Doc) {
  doc.load(() => {
    if (doc.isEmpty) {
      const pageBlockId = doc.addBlock('affine:page', {});
      doc.addBlock('affine:surface', {}, pageBlockId);
    }
      
  });

  const editor = new AffineEditorContainer();
  editor.doc = doc;
  return { editor, collection };
}
