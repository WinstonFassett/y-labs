declare module 'y-codemirror.next' {
  import { Extension } from '@codemirror/state'
  import { Text } from 'yjs'
  import { Awareness } from 'y-protocols/awareness'

  export interface YSyncOpts {
    ytext: Text
    awareness?: Awareness
    undoManager?: any
  }

  export function ySync(opts: YSyncOpts): Extension
  export function yUndoManager(): Extension
  export function ySyncFacet(): Extension 
  export function yAwareness(): Extension
  export function yCollab(ytext: Text, awareness?: Awareness): Extension
}