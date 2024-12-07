import { atom, map, onMount } from 'nanostores';
import * as Y from 'yjs';
import { ySyncPluginKey } from 'y-prosemirror';
import { type Version, type VersionGraph, addVersion, buildVersionGraph } from '../utils/versionManager';
import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';
import { getYdoc } from './yjs-docs';

const docVersionsById = mapTemplate(
  (id) => {
    const sourceDoc = getYdoc(id).get()
    return createVersionControlStore(sourceDoc)
  }
)

export function getDocVersionsStoreById(id: string) {
  return docVersionsById(id)
}

export function createVersionControlStore(sourceDoc: Y.Doc) {
  const store = map({
    displayVersionId: null as string | null,
  })
  console.log('CREATE DOC VERSIONS', store)
  const yversions = sourceDoc.getArray('versions')
  // Store states
  const $versions = atom<Y.Array<Version>>(sourceDoc.getArray('versions'));
  const $versionGraph = atom<VersionGraph | null>(null);
  // const $displayVersionId = atom<string | null>(null);
  const $stackSizes = map<{undo: number; redo: number}>({ undo: 0, redo: 0 });
  
  // Create replay doc
  const replayDoc = new Y.Doc();
  

  // Initialize UndoManager
  const type = sourceDoc.get('prosemirror', Y.XmlFragment);
  const undoManager = new Y.UndoManager(type, {
    trackedOrigins: new Set([ySyncPluginKey, null])
  });


  // Handle stack changes
  const handleStackChange = () => {
    $stackSizes.set({
      undo: undoManager.undoStack.length,
      redo: undoManager.redoStack.length
    });
    addVersion(sourceDoc);
  };

  onMount(store, () => {
    console.log('MOUNT DOC VERSIONS')
    // Setup listeners
    undoManager.on('stack-item-added', handleStackChange);
    undoManager.on('stack-item-popped', handleStackChange);

    // Watch versions array
    const versionsArray = sourceDoc.getArray<Version>('versions');
    const onVersionsChange = () => {
      $versions.set(versionsArray);
      const graph = buildVersionGraph(Array.from(versionsArray));
      $versionGraph.set(graph);
    }
    versionsArray.observe(onVersionsChange);

    return () => {
      console.log('UNMOUNT DOC VERSIONS')
      versionsArray.unobserve(onVersionsChange);
      undoManager.destroy();
    }
  })

  // Actions
  function undo() {
    undoManager.undo();
  }

  function redo() {
    undoManager.redo();
  }

  function cleanup() {
    undoManager.destroy();
  }

  return Object.assign(store, {
    // State
    $versions,
    $versionGraph,
    $stackSizes,
    replayDoc,
    
    // Actions
    undo,
    redo,
    cleanup
  });
}