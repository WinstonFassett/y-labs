import * as Y from 'yjs'
import { getNovelShares } from "../novel/novel-shares";
import { getBlocknoteShares } from "../blocknote/blocknote-shares";
import { getBlocksuiteShares } from "../blocksuite/blocksuite-shares";
import { getTlDrawShares } from '../tldraw/tldraw-shares';
import { getCodeMirrorShares } from '../codemirror/codemirror-shares';
import { getRemirrorShares } from '../remirror/remirror-shares';

export function getSharesForType(ydoc: Y.Doc, type: string): Record<string, Y.AbstractType<any>> {
  switch (type) {
    case 'novel':
      return getNovelShares(ydoc);
    case 'blocknote':
      return getBlocknoteShares(ydoc);
    case 'blocksuite':
      return getBlocksuiteShares(ydoc);
    case 'tldraw':
      return getTlDrawShares(ydoc);
    case 'codemirror': 
      return getCodeMirrorShares(ydoc);
    case 'remirror': 
    return getRemirrorShares(ydoc);
    default:
      return {};
  }
}
