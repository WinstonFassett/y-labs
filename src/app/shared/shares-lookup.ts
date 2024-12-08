import * as Y from 'yjs'
import { getNovelShares } from "../novel/novel-shares";

export function getSharesForType(ydoc: Y.Doc, type: string): Record<string, Y.AbstractType<any>> {
  switch (type) {
    case 'novel':
      return getNovelShares(ydoc);
    default:
      return {};
  }
}
