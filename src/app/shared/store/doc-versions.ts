import { atom, computed, map, onMount, onSet } from 'nanostores';
import * as Y from 'yjs';
import { ySyncPluginKey, yUndoPluginKey } from 'y-prosemirror';
import { type Version, type VersionGraph, addVersion, buildVersionGraph } from '../utils/versionManager';
import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';
import { getYdoc } from './yjs-docs';
import { getSharesForType } from '../shares-lookup';

const VersionsByDocEditor = mapTemplate((id, { docId, type }:{docId:string, type:string}) => {
  const sourceDoc = getYdoc(docId,).get()
  return createVersionControlStore(sourceDoc, {type})
})

export function getDocVersionsStoreByDocEditor(docId: string, type: string) {
  const typedDocId = `${type}:${docId}`
  console.log('getDocVersionsStoreByDocEditor', typedDocId)
  return VersionsByDocEditor(typedDocId, {type, docId})
}

export function createVersionControlStore(sourceDoc: Y.Doc, {type}:{type: string}) {
  const store = map({
    displayVersionId: null as string | null,
  })

  const yversions = sourceDoc.getArray<Version>('versions')
  const $versions = atom<Version[]>(Array.from(yversions));

  // onSet($versions, (versions) => {  
  //   console.log('set versions', versions)
  //   const latestVersion
  // })

  onMount($versions, () => {
    const onVersionsChange = () => {
      const versions = Array.from(yversions);
      $versions.set(versions);
      // clear last version if a match
      const lastVersion = store.get().displayVersionId
      // console.log({ lastVersion })
      // if (lastVersion && versions[versions.length - 1].id === lastVersion) {
      //   console.log('MATCHED LAST VERSION')
      //   store.setKey('displayVersionId', null)
      // }
      // const latestVersionId = versions.length > 0 ? versions[versions.length - 1].id : null;

    }
    yversions.observe(onVersionsChange);
    return () => {
      yversions.unobserve(onVersionsChange);      
    }
  })

  const $versionGraph = computed($versions, (versions) => {
    return buildVersionGraph(versions);
  })

  const $isLatestVersion = computed([store, $versions], ({displayVersionId}, versions) => {
    return displayVersionId === null || (
      versions?.length > 0 &&
      displayVersionId === versions[versions.length - 1].id
    )
  })

  const $stackSizes = map<{undo: number; redo: number}>({ undo: 0, redo: 0 });
  
  // const replayDoc = new Y.Doc();
  const $replayDoc = atom<Y.Doc>(new Y.Doc());
  
  // Initialize UndoManager
  // create ytypes for undoManager by looping over doc.shares Map and 
  const yTypes = Object.values(getSharesForType(sourceDoc, type))

  console.log({yTypes})
  const undoManager = new Y.UndoManager(yTypes, {
    // trackedOrigins: new Set([ySyncPluginKey, null])
    trackedOrigins: new Set([
      'y-sync$',
      'y-undo$',
      yUndoPluginKey, yUndoPluginKey.constructor,
      ySyncPluginKey, ySyncPluginKey.constructor,
      null,
    ]),
  });
  console.log({undoManager})
  // Inside createVersionControlStore but before handleStackChange
  let isFirstStackChange = true;
  
  const handleStackChange = () => {
    // if (isFirstStackChange) {
    //   console.log('ignore auto stack change')
    //   isFirstStackChange = false;
    //   return;
    // }
  
    console.log('stack change!!')
    $stackSizes.set({
      undo: undoManager.undoStack.length,
      redo: undoManager.redoStack.length
    });
    addVersion(sourceDoc);
  };
  onMount(store, () => {
    console.log('MOUNT doc versions store', store, undoManager)
    const gcBefore = sourceDoc.gc
    sourceDoc.gc = false
    undoManager.on('stack-item-added', handleStackChange);
    undoManager.on('stack-item-popped', handleStackChange);
    return () => {
      console.log('UNMOUNT doc versions store', store)
      undoManager.destroy();
      sourceDoc.gc = gcBefore
    }
  })

  // // Watch versions array for changes
  // useEffect(() => {
  //   const versionsArray = sourceDoc.getArray('versions');

  //   const handleUpdate = () => {
  //     setVersions(versionsArray);
  //     const graph = buildVersionGraph(Array.from(versionsArray));
  //     setVersionGraph(graph);
      
  //     // If we're viewing the latest version or no version is selected,
  //     // stay in live editing mode
  //     if (!displayVersionId || displayVersionId === getLatestVersionId(sourceDoc)) {
  //       setDisplayVersionId(null);
  //     }
  //   };

  //   versionsArray.observe(handleUpdate);
  //   handleUpdate();

  //   return () => versionsArray.unobserve(handleUpdate);
  // }, [sourceDoc, displayVersionId]);

  function switchToVersion(versionId: string | null) {
    // if (versionId === null) {
    //   setDisplayVersionId(null);
    //   return;
    // }
    console.log('switch to version', versionId)
    store.setKey('displayVersionId', versionId)
    const versionGraph = $versionGraph.get();
    if (!versionGraph?.nodes.has(versionId)) return;

    const version = versionGraph.nodes.get(versionId);
    if (!version) return;

    const snapshot = Y.decodeSnapshot(version.snapshot);
    const newDoc = Y.createDocFromSnapshot(sourceDoc, snapshot);
    // setReplayDoc(newDoc);
    console.log('setting replayDoc', newDoc)
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