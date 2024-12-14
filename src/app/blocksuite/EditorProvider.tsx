import { createEmptyDoc } from '@blocksuite/presets';
import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { getBlocksuiteDocStore } from '../shared/store/blocksuite-docs';
import { useDocEditor } from '../shared/useDocEditor';
import { useDocParams } from '../shared/useDocParams';
import { EditorContext } from './context';
import { createEditor } from './createEditor';
import { Button } from '@/components/ui/button';
import type { DocMode } from '@blocksuite/blocks';

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<DocMode>('page')
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

  const editorContext = useMemo(() => {
    if (!loaded) return null
    const editorContext = createEditor(currentBsDoc)
    return editorContext
  }, [currentBsDoc, loaded])
  
  useEffect(() => {
    if (editorContext && editorContext.editor.mode !== mode) {
      editorContext.editor.switchEditor(mode)
    }
  },[editorContext, mode])

  return (!editorContext ? <div>Loading...</div> : 
    <EditorContext.Provider value={editorContext}>
    <div className='sticky top-0 z-50 flex flex-row p-1'>
      <div className='flex-grow'></div>
      <Button 
        variant='outline' 
        style={{width: 'inherit'}}
        size='sm'
        onClick={() => {        
          setMode(mode === 'page' ? 'edgeless' : 'page')
        }}>
          Show {mode === 'page' ? 'Board' : 'Doc'}
        </Button>      
    </div>
      {children}
    </EditorContext.Provider>
  );
};
