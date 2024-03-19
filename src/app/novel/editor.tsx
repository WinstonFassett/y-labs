import { useStore } from "@nanostores/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { StarterKit } from "novel/extensions";
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
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <AppBar />
      {/* <p>{loadState}</p> */}
      <Novel
        className=""
        extensions={[
          StarterKit.configure({
            history: false,
          }),
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
