import * as Y from 'yjs';

export interface Version {
  id: string;
  parentId: string | null;
  date: number;
  snapshot: Uint8Array;
  clientId: number;
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface VersionNode extends Version {
  children: VersionNode[];
}

export interface VersionGraph {
  nodes: Map<string, VersionNode>;
  root: VersionNode;
}