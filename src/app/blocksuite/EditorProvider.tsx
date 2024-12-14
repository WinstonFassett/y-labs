import { createEmptyDoc } from '@blocksuite/presets';
import { useStore } from '@nanostores/react';
import { useMemo } from 'react';
import * as Y from 'yjs';
import { getBlocksuiteDocStore } from '../shared/store/blocksuite-docs';
import { useDocEditor } from '../shared/useDocEditor';
import { useDocParams } from '../shared/useDocParams';
import { EditorContext } from './context';
import { createEditor } from './createEditor';

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const { docId } = useDocParams()
  const bsDocStore = getBlocksuiteDocStore(docId)
  const bsDoc = useStore(bsDocStore)
  const { loaded, isLatestVersion, currentDoc } = useDocEditor({ type: 'blocksuite'})
  
  const currentBsDoc = useMemo(() => {
    if (isLatestVersion) {
      return bsDoc
    }
    const bsVersionDoc = createEmptyDoc().doc
    const update = Y.encodeStateAsUpdate(currentDoc)
    Y.applyUpdate(bsVersionDoc.spaceDoc, update)
    return bsVersionDoc
  }, [currentDoc])

  const value = useMemo(() => loaded && createEditor(currentBsDoc), [currentBsDoc, loaded])

  return (!value ? <div>Loading...</div> : 
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
