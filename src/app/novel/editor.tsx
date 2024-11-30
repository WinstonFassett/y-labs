import { useStore } from "@nanostores/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import AppBar from "../shared/AppBar";
import { getDocLoadState } from "../shared/store/doc-loader";
import { user } from "../shared/store/local-user";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { Novel } from "./Novel";

import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
function Editor() {
  const { docId, ydoc, $room, roomId, needsPasswordToConnect } = useDocCollabStore();
  const loadState = useStore(getDocLoadState(docId, roomId));
  const fragment = ydoc.getXmlFragment("novel");
  const provider = $room?.get().provider;
  const u = user.get();
  const canShow = !needsPasswordToConnect || loadState === "loaded";
  return (
    <div className="min-h-full flex-1 flex flex-col max-w-3xl mx-auto w-full">
      <AppBar className="h-16" />
      {!canShow && <div>Loading...</div>}
      {canShow && 
        <Novel
          key={roomId ?? docId}
          disableHistory={true}
          extensions={[
            TextStyle as any, 
            Color,
            Highlight.configure({ multicolor: true }),
            Collaboration.configure({
              fragment,
            }),
            ...(provider
              ? [
                  CollaborationCursor.configure({
                    provider,
                    user: {
                      name: u.username,
                      color: u.color,
                    },
                  }),
                ]
              : []),
          ].filter((x) => !!x)}
        />
      }
      <PasswordRequiredDialog />
    </div>
  );
}
export default Editor;
