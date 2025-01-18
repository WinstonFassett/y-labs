import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';
import { type ReadableAtom, atom, computed, map, onMount } from 'nanostores';
import { ySyncPluginKey, yUndoPluginKey } from 'y-prosemirror';
import * as Y from 'yjs';
import { getSharesForType } from '../shares-lookup';
import { addVersion, buildVersionGraph, restoreVersion, type Version } from '../utils/versionManager';
import { getYdoc } from './doc-yjs';
import { Doc as BlocksuiteDoc } from '@blocksuite/store';
import { $trackHistoryWhenEditing } from './local-settings';

const VersionsByDocEditor = mapTemplate((id, { docId, type }:{docId:string, type:string}) => {
  const $sourceDoc = getYdoc(docId,)
  const sourceDoc = $sourceDoc.get()  
  return createVersionControlStore(sourceDoc, {type})
})

export function getDocVersionsStoreByDocEditor(docId: string, type: string) {
  const typedDocId = `${type}:${docId}`
  return VersionsByDocEditor(typedDocId, {type, docId})
}

export function createVersionControlStore(sourceDoc: Y.Doc, {type}:{type: string}) {
  const store = map({
    displayVersionId: null as string | null,
  })

  const yversions = sourceDoc.getArray<Version>('versions')
  const $versions = atom<Version[]>(Array.from(yversions));

  onMount($versions, () => {
    const onVersionsChange = () => {
      $versions.set(Array.from(yversions));
    }
    yversions.observe(onVersionsChange);
    return () => {
      yversions.unobserve(onVersionsChange);      
    }
  })

  const $versionGraph = computed($versions, (versions) => {
    return buildVersionGraph(versions);
  })

  const $isLatestVersion = computed([store, $versions], ({ displayVersionId }, versions) => 
    checkIfLatestVersion(displayVersionId, versions)
  )

  const $stackSizes = map<{undo: number; redo: number}>({ undo: 0, redo: 0 });
  
  const $replayDoc = atom<Y.Doc>(new Y.Doc());
  
  // Initialize UndoManager
  // create ytypes for undoManager by looping over doc.shares Map and 
  const yTypes = Object.values(getSharesForType(sourceDoc, type))



  const trackedOrigins = new Set([
    "yCodemirrorSyncPluginKey",
    "y-sync$",
    "y-undo$",
    yUndoPluginKey,
    yUndoPluginKey.constructor,
    ySyncPluginKey,
    ySyncPluginKey.constructor,
    null,
  ])

  const { blocksuite } = sourceDoc as { blocksuite?: BlocksuiteDoc} 
  if (blocksuite){
    const blocksuiteOrigin = blocksuite?.blockCollection.spaceDoc.clientID
    trackedOrigins.add(blocksuiteOrigin as any)
  }

  
  const $undoManager = computed(
    $trackHistoryWhenEditing,
    (track) =>
      track &&
      new Y.UndoManager(yTypes, {
        trackedOrigins,
      }),
  );
  
  onMount(store, () => {
    return enterLeave($undoManager, (undoManager) => {
      if (!undoManager) return;
      const gcBefore = sourceDoc.gc
      sourceDoc.gc = false
      const handleStackChange = () => {
        $stackSizes.set({
          undo: undoManager.undoStack.length,
          redo: undoManager.redoStack.length
        });
        addVersion(sourceDoc);
      };
      undoManager.on('stack-item-added', handleStackChange);
      undoManager.on('stack-item-popped', handleStackChange);
      return () => {
        undoManager.destroy();
        sourceDoc.gc = gcBefore
      }
    })
  })

  function enterLeave<S extends ReadableAtom<any>>(
    store: S,
    onEnter: ((value: ReturnType<S['get']>, prev: ReturnType<S['get']> | undefined) => void) | (() => void)
  ) {
    let onLeave: (() => void) | void | null = null;
    return store.subscribe((value, oldValue) => {
      if (onLeave) {
        const leave = onLeave
        onLeave = null
        leave()
      }
      onLeave = onEnter(value, oldValue);
    })
    
  }

  function switchToVersion(versionId: string | null) {
    const versions = $versions.get();
    const isLatestVersion = checkIfLatestVersion(versionId, versions);

    if (isLatestVersion) {
      // If we're viewing the latest version, switch to live editing mode
      store.setKey('displayVersionId', null)
      $replayDoc.set(new Y.Doc());
      return;
    }

    store.setKey('displayVersionId', versionId)
    const versionGraph = $versionGraph.get();
    if (!versionGraph?.nodes.has(versionId)) return;

    const version = versionGraph.nodes.get(versionId);
    if (!version) return;
    
    const newDoc = restoreVersion(sourceDoc, version);
    $replayDoc.set(newDoc);
  }

  return Object.assign(store, {
    $isLatestVersion,
    $versions,
    $versionGraph,
    $stackSizes,
    $replayDoc,
    switchToVersion
  });
}


export function checkIfLatestVersion(displayVersionId: string, versions: Version[]) {
  if (displayVersionId === null) return true;
  const latestVersionId = versions.length > 0 ? versions[versions.length - 1].id : null;
  return displayVersionId === latestVersionId;
}
