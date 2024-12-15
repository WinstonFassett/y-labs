import { collection } from '@/app/shared/store/blocksuite-docs';
import { AffineEditorContainer } from '@blocksuite/presets';
import { Doc, DocCollection, Text } from '@blocksuite/store';

import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';

blocksEffects();
presetsEffects();

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function createEditor(doc: Doc, mode: 'edgeless' | 'page' = 'edgeless') {
  
  doc.load(() => {
    if (doc.isEmpty) {
      const rootId = doc.addBlock('affine:page', {
        title: new Text()
      });
      doc.addBlock('affine:surface', {}, rootId);
    }
  });

  const editor = new AffineEditorContainer();
  editor.doc = doc;
  return { editor, collection };
}
