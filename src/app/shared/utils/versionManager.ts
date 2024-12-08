import { v4 as uuidv4 } from 'uuid';
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

const ROOT_VERSION_ID = '00000000-0000-0000-0000-000000000000';

export function createRootVersion(): Version {
  return {
    id: ROOT_VERSION_ID,
    parentId: null,
    date: Date.now(),
    snapshot: Y.encodeSnapshot(Y.emptySnapshot),
    clientId: 0,
    metadata: {
      description: 'Empty Document',
      tags: ['root']
    }
  };
}

export function addVersion(doc: Y.Doc, parentId: string = getLatestVersionId(doc)): void {
  console.log('add version!, parentId:', parentId)
  const versionsArray = doc.getArray<Version>('versions');
  const snapshot = Y.encodeSnapshot(Y.snapshot(doc));
  
  // Don't add if it's identical to the latest version
  if (versionsArray.length > 0) {
    const latestVersion = versionsArray.get(versionsArray.length - 1);
    if (areSnapshotsEqual(snapshot, latestVersion.snapshot)) {
      return;
    }
  }
  
  // Don't add if it's identical to the root version (empty)
  if (versionsArray.length === 0 && areSnapshotsEqual(snapshot, Y.encodeSnapshot(Y.emptySnapshot))) {
    return;
  }
  
  const newVersion: Version = {
    id: uuidv4(),
    parentId,
    date: Date.now(),
    snapshot,
    clientId: doc.clientID,
  };
  
  doc.transact(() => {
    versionsArray.push([newVersion]);
  });
}

function areSnapshotsEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export function getLatestVersionId(doc: Y.Doc): string {
  const versionsArray = doc.getArray<Version>('versions');
  return versionsArray.length > 0 
    ? versionsArray.get(versionsArray.length - 1).id 
    : ROOT_VERSION_ID;
}

export function restoreVersion(sourceDoc: Y.Doc, version: Version): Y.Doc {
  const snapshot = Y.decodeSnapshot(version.snapshot);
  return Y.createDocFromSnapshot(sourceDoc, snapshot);
}

export function buildVersionGraph(versions: Version[]): VersionGraph {
  const nodes = new Map<string, VersionNode>();
  
  // Always start with root version
  const rootVersion = createRootVersion();
  nodes.set(ROOT_VERSION_ID, { ...rootVersion, children: [] });
  
  // Add all other versions
  versions.forEach(version => {
    if (!nodes.has(version.id)) {
      nodes.set(version.id, { ...version, children: [] });
    }
  });
  
  // Build relationships
  nodes.forEach(node => {
    if (node.parentId) {
      const parent = nodes.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });
  
  return {
    nodes,
    root: nodes.get(ROOT_VERSION_ID)!
  };
}

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

export function findBranches(graph: VersionGraph): VersionNode[][] {
  const branches: VersionNode[][] = [];
  const mainBranch = new Set(findMainBranch(graph).map(node => node.id));
  
  function traverseBranch(node: VersionNode, currentBranch: VersionNode[]) {
    if (!mainBranch.has(node.id)) {
      currentBranch.push(node);
    }
    
    // Sort children by date for consistent ordering
    const sortedChildren = [...node.children].sort((a, b) => a.date - b.date);
    
    // If this node has multiple children, create new branches
    if (sortedChildren.length > 1) {
      for (let i = 1; i < sortedChildren.length; i++) {
        const newBranch = [...currentBranch];
        traverseBranch(sortedChildren[i], newBranch);
        if (newBranch.length > 0) {
          branches.push(newBranch);
        }
      }
    }
    
    // Continue with first child if it exists and isn't in main branch
    if (sortedChildren[0] && !mainBranch.has(sortedChildren[0].id)) {
      traverseBranch(sortedChildren[0], currentBranch);
    }
  }
  
  traverseBranch(graph.root, []);
  return branches;
}
