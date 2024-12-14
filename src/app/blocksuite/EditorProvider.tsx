import { useStore } from '@nanostores/react';
import { useEffect, useMemo } from 'react';
import { getBlocksuiteDocStore } from '../shared/store/blocksuite-docs';
import { useDocParams } from '../shared/useDocParams';
import { EditorContext } from './context';
import { createEditor } from './createEditor';
import { useDocEditor } from '../shared/useDocEditor';
import { createEmptyDoc } from '@blocksuite/presets';
import * as Y from 'yjs';

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const { docId } = useDocParams()
  const bsDocStore = getBlocksuiteDocStore(docId)

  /*
  Hmm. Blocksuite is making this difficult because they insist on creating the Y Doc internally
  I was able to hack around it here by using a store that actually overrides the YDoc
  But now I need versions. I need a way to use my hooks to get the current version
  Which involves building a new YDoc from scratch
  Maybe I need to do that and then restore into the blocksuite doc
  But no for collab I need it to be my yjs doc
  Could look at extending block collection
  BlockCollection itself is built around a yjs doc though
  It is managing a collection of docs behind the scenes
  Hmm.
  Aside: Maybe revisit how prosemirror-versions demo does restores
  ok I think I just need to rethink my store deps
  need version-aware stores
  should they be route aware? they could be
  hmmm. but that would be a constraint really


  */

  const bsDoc = useStore(bsDocStore)
  const { loaded, loadState, mode, isLatestVersion, currentDoc, docEditorKey } = useDocEditor({ type: 'blocksuite'})
  
  const currentBsDoc = useMemo(() => {
    console.log({ currentDoc, isLatestVersion })
    if (isLatestVersion) {
      return bsDoc
    }
    const bsVersionDoc = createEmptyDoc().doc // .init();
    const update = Y.encodeStateAsUpdate(currentDoc)
    Y.applyUpdate(bsVersionDoc.spaceDoc, update)
    console.log({bsVersionDoc, json: bsVersionDoc.spaceDoc.toJSON()})
    return bsVersionDoc
  }, [currentDoc])
  const value = useMemo(() => {
    if (loaded) {
      console.log('loaded. creating editor', currentBsDoc)
      return createEditor(currentBsDoc)
    }
    // loaded ? createEditor(currentBsDoc) : undefined
  }, [currentBsDoc, loaded])

  // useEffect(() => {
  //   console.log('doc changed', docEditorKey)
  // }, [currentBsDoc])

  console.log('loaded?', loaded, currentBsDoc) 
  return (!value ? <div>Loading...</div> : 
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
