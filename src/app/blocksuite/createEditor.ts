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

  // ok the problem is
  // blocksuite's background sync is marking this as synced/loaded
  // even though still waiting on loader to load it
  // making this probably the wrong place to initialize
  // a new blocksuite doc
  // in the case when doc is marked loaded, it does exist
  doc.load(() => {
    if (doc.isEmpty) {
      console.log('doc is empty (it seems)')
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
