import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';
import { atom, computed, map, onMount } from 'nanostores';
import { ySyncPluginKey, yUndoPluginKey } from 'y-prosemirror';
import * as Y from 'yjs';
import { getSharesForType } from '../shares-lookup';
import { addVersion, buildVersionGraph, type Version } from '../utils/versionManager';
import { getYdoc } from './yjs-docs';

const VersionsByDocEditor = mapTemplate((id, { docId, type }:{docId:string, type:string}) => {
  const sourceDoc = getYdoc(docId,).get()
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

  const undoManager = new Y.UndoManager(yTypes, {
    trackedOrigins: new Set([
      'y-sync$',
      'y-undo$',
      yUndoPluginKey, yUndoPluginKey.constructor,
      ySyncPluginKey, ySyncPluginKey.constructor,
      null,
    ]),
  });
  
  
  onMount(store, () => {
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

    const snapshot = Y.decodeSnapshot(version.snapshot);
    const newDoc = Y.createDocFromSnapshot(sourceDoc, snapshot);
    $replayDoc.set(newDoc);
  }

  // Actions
  function undo() {
    undoManager.undo();
  }

  function redo() {
    undoManager.redo();
  }

  return Object.assign(store, {
    $isLatestVersion,
    $versions,
    $versionGraph,
    $stackSizes,
    $replayDoc,
    undoManager,
    undo,
    redo,
    switchToVersion
  });
}


export function checkIfLatestVersion(displayVersionId: string, versions: Version[]) {
  if (displayVersionId === null) return true;
  const latestVersionId = versions.length > 0 ? versions[versions.length - 1].id : null;
  return displayVersionId === latestVersionId;
}
