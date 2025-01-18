import type { DocMode } from '@blocksuite/blocks';
import { createEmptyDoc } from '@blocksuite/presets';
import * as Y from 'yjs';
import { useStore } from '@nanostores/react';
import { useState, useMemo, useEffect } from 'react';
import { getBlocksuiteDocStore } from '../shared/store/doc-blocksuite';
import { useDocEditor } from '../shared/useDocEditor';
import { useDocParams } from '../shared/useDocParams';
import EditorContainer from './EditorContainer';
import { EditorProvider } from './EditorProvider';
import { createEditor } from './createEditor';
import './style.css';
import { Button } from '@/components/ui/button';

function App() {
  const [mode, setMode] = useState<DocMode>('page')
  const { docId } = useDocParams()
  const bsDocStore = getBlocksuiteDocStore(docId!)
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
    const editor = createEditor(currentBsDoc, mode)
    return {
      editor,
      collection: currentBsDoc.collection,
    }
  }, [currentBsDoc, loaded])
  
  useEffect(() => {
    if (editorContext && editorContext.editor.mode !== mode) {
      editorContext.editor.switchEditor(mode)
    }
  },[editorContext, mode])
  
  if (!editorContext) return null;
  return (
    <EditorProvider value={editorContext}>
        <EditorContainer />
        <div className='fixed top-16 right-5 flex flex-row items-center'>
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
    </EditorProvider>
  );
}

export default App;
