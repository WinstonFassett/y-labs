import { useState, useCallback, useRef } from 'react';
import type { VersionGraph, VersionNode } from '../../lib/yjs-versions';

export function findMainBranch(graph: VersionGraph): VersionNode[] {
  const branch: VersionNode[] = [];
  let current: VersionNode | undefined = graph.root;
  
  while (current) {
    branch.push(current);
    // Follow the child with the earliest timestamp
    current = current.children.sort((a, b) => a.date - b.date)[0];
  }
  
  return branch;
}

export function usePlayback(
  versionGraph: VersionGraph | null,
  currentVersionId: string | null,
  onJumpToVersion: (id: string | null) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current !== null) {
      window.clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (!versionGraph) return;
    
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const mainBranch = findMainBranch(versionGraph);
    if (mainBranch.length <= 1) return;

    let currentIndex = currentVersionId 
      ? mainBranch.findIndex(node => node.id === currentVersionId)
      : -1;

    // If at end or not found, start from beginning
    if (currentIndex === -1 || currentIndex >= mainBranch.length - 1) {
      currentIndex = -1;
      onJumpToVersion(mainBranch[0].id);
    }

    setIsPlaying(true);
    
    // Start with the next version after the current one
    const nextIndex = currentIndex + 1;
    if (nextIndex < mainBranch.length) {
      onJumpToVersion(mainBranch[nextIndex].id);
    }
    
    playIntervalRef.current = window.setInterval(() => {
      currentIndex++;
      
      if (currentIndex >= mainBranch.length - 1) {
        stopPlayback();
        return;
      }

      onJumpToVersion(mainBranch[currentIndex + 1].id);
    }, 500);
  }, [isPlaying, currentVersionId, versionGraph, onJumpToVersion, stopPlayback]);

  return {
    isPlaying,
    togglePlayback,
    stopPlayback
  };
}