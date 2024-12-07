import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { ySyncPluginKey } from 'y-prosemirror';
import { addVersion } from '../utils/versionManager';

export function useUndoManager(doc: Y.Doc) {
  const [stackSizes, setStackSizes] = useState({ undo: 0, redo: 0 });
  const undoManagerRef = useRef<Y.UndoManager | null>(null);

  useEffect(() => {
    const type = doc.get('prosemirror', Y.XmlFragment);
    const undoManager = new Y.UndoManager(type, {
      trackedOrigins: new Set([ySyncPluginKey, null]),
    });

    const handleStackChange = () => {
      setStackSizes({
        undo: undoManager.undoStack.length,
        redo: undoManager.redoStack.length,
      });
      addVersion(doc);
    };

    undoManager.on('stack-item-added', handleStackChange);
    undoManager.on('stack-item-popped', handleStackChange);

    undoManagerRef.current = undoManager;

    return () => {
      undoManager.destroy();
    };
  }, [doc]);

  return {
    undoManager: undoManagerRef.current,
    undoStackSize: stackSizes.undo,
    redoStackSize: stackSizes.redo,
  };
}