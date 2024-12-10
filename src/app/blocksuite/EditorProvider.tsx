import { useStore } from '@nanostores/react';
import { useMemo } from 'react';
import { getBlocksuiteDoc } from '../shared/store/blocksuite-docs';
import { useDocParams } from '../shared/useDocParams';
import { EditorContext } from './context';
import { initEditor } from './editor';
import { useDocEditor } from '../shared/useDocEditor';

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const { docId } = useDocParams()
  const bsDocStore = getBlocksuiteDoc(docId)
  const doc = useStore(bsDocStore)
  const { loaded, loadState, mode, ydoc } = useDocEditor({ type: 'blocksuite'})
  const value = useMemo(() => loaded ? initEditor(doc) : undefined, [doc, loaded])

  console.log('loaded?', loaded, ydoc) 
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
