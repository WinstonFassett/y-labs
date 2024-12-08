import TipTapCollaboration from '@tiptap/extension-collaboration'
import { ySyncPlugin } from 'y-prosemirror'

export const Collaboration = TipTapCollaboration.extend({
  addProseMirrorPlugins() {
    const fragment = this.options.fragment
      ? this.options.fragment
      : this.options.document.getXmlFragment(this.options.field)

    // let undoManager: UndoManager = this.options.fragment?.doc.undoManager
    // console.log({ undoManager})
    // if 
    // const yUndoPluginInstance = yUndoPlugin({ undoManager })
    return [
      ySyncPlugin(fragment),
      // yUndoPluginInstance
    ]
  }
})