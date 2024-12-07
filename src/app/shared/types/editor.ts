import * as Y from 'yjs';

export interface EditorProps {
  ydoc: Y.Doc;
  readOnly?: boolean;
}

export interface TimelineControlsProps {
  onJumpToSnapshot: (index: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  currentIndex: number;
  totalVersions: number;
}

export interface VersionHistoryProps {
  versions: Y.Array<any>;
  currentIndex: number;
  onVersionSelect: (index: number) => void;
}