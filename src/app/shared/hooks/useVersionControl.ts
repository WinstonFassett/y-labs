import { useState, useCallback, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { ySyncPluginKey } from 'y-prosemirror';
import { Version, VersionGraph } from '../types/version';
import { 
  addVersion, 
  buildVersionGraph,
  getLatestVersionId
} from '../utils/versionManager';
import { usePlayback } from './usePlayback';

export function useVersionControl(sourceDoc: Y.Doc) {
  const [displayVersionId, setDisplayVersionId] = useState<string | null>(null);
  const [versions, setVersions] = useState<Y.Array<Version>>(
    sourceDoc.getArray('versions')
  );
  const [versionGraph, setVersionGraph] = useState<VersionGraph | null>(null);
  const [replayDoc, setReplayDoc] = useState(() => new Y.Doc());
  const [stackSizes, setStackSizes] = useState({ undo: 0, redo: 0 });
  const undoManagerRef = useRef<Y.UndoManager | null>(null);

  // Initialize UndoManager
  useEffect(() => {
    const type = sourceDoc.get('prosemirror', Y.XmlFragment);
    const undoManager = new Y.UndoManager(type, {
      trackedOrigins: new Set([ySyncPluginKey, null])
    });

    const handleStackChange = () => {
      setStackSizes({
        undo: undoManager.undoStack.length,
        redo: undoManager.redoStack.length,
      });
      addVersion(sourceDoc);
    };

    undoManager.on('stack-item-added', handleStackChange);
    undoManager.on('stack-item-popped', handleStackChange);

    undoManagerRef.current = undoManager;

    return () => {
      undoManager.destroy();
    };
  }, [sourceDoc]);

  // Watch versions array for changes
  useEffect(() => {
    const versionsArray = sourceDoc.getArray<Version>('versions');

    const handleUpdate = () => {
      setVersions(versionsArray);
      const graph = buildVersionGraph(Array.from(versionsArray));
      setVersionGraph(graph);
      
      // If we're viewing the latest version or no version is selected,
      // stay in live editing mode
      if (!displayVersionId || displayVersionId === getLatestVersionId(sourceDoc)) {
        setDisplayVersionId(null);
      }
    };

    versionsArray.observe(handleUpdate);
    handleUpdate();

    return () => versionsArray.unobserve(handleUpdate);
  }, [sourceDoc, displayVersionId]);

  const handleJumpToVersion = useCallback(
    (versionId: string | null) => {
      if (versionId === null) {
        setDisplayVersionId(null);
        return;
      }

      if (!versionGraph?.nodes.has(versionId)) return;

      const version = versionGraph.nodes.get(versionId);
      if (!version) return;

      const snapshot = Y.decodeSnapshot(version.snapshot);
      const newDoc = Y.createDocFromSnapshot(sourceDoc, snapshot);
      setReplayDoc(newDoc);
      setDisplayVersionId(versionId);
    },
    [versionGraph, sourceDoc]
  );

  const {
    isPlaying,
    togglePlayback,
    stopPlayback
  } = usePlayback(
    versionGraph,
    displayVersionId,
    handleJumpToVersion
  );

  const currentVersionId = displayVersionId === null 
    ? getLatestVersionId(sourceDoc)
    : displayVersionId;

  const isEditing = displayVersionId === null;
  const activeDoc = isEditing ? sourceDoc : replayDoc;

  return {
    currentVersionId,
    displayVersionId,
    versions,
    versionGraph,
    isPlaying,
    togglePlayback,
    jumpToVersion: handleJumpToVersion,
    stopPlayback,
    isEditing,
    activeDoc,
    undoManager: undoManagerRef.current,
    undoStackSize: stackSizes.undo,
    redoStackSize: stackSizes.redo,
  };
}