import { useStore } from "@nanostores/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import AppBar from "../shared/AppBar";
import { getDocLoadState } from "../shared/store/doc-loader";
import { user } from "../shared/store/local-user";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { Novel } from "./Novel";
import "./tiptap-collab.css";
function Editor() {
  const { docId, ydoc, $room, roomId } = useDocCollabStore();
  const loadState = useStore(getDocLoadState(docId, roomId));
  const fragment = ydoc.getXmlFragment("novel");
  const provider = $room?.provider;
  const u = user.get();
  return (
    <div className="min-h-full flex-1 flex flex-col max-w-3xl mx-auto w-full">
      <AppBar className="h-16" />
      {/* <p>{loadState}</p> */}
      <Novel
        disableHistory={true}
        extensions={[
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
    </div>
  );
}
export default Editor;
