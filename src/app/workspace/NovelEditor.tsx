import { useStore } from "@nanostores/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style';
import AppBar from "@/app/shared/AppBar";
import { getDocLoadState } from "@/app/shared/store/doc-loader";
import { user } from "@/app/shared/store/local-user";
import { useDocCollabStore } from "@/app/shared/useDocCollabStore";

// import "./tiptap-collab.css";
import Novel from "@/app/novel/Novel";
import { getDocRoomId } from "../shared/store/doc-room-config";
function NovelEditor() {
  const { docId, ydoc, $room, roomId } = useDocCollabStore();
  const docRoomId = getDocRoomId(docId, roomId);
  const loadState = useStore(getDocLoadState(docId, roomId));
  const fragment = ydoc.getXmlFragment("novel");
  const provider = $room?.get().provider;
  const ready = loadState === "loaded";
  const providerReady = roomId ? !!provider : true;
  const u = user.get();
  const waiting = !providerReady && !ready ;
  return (
    <div className="min-h-full flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
      {waiting && <div>Loading...</div>}
      {!waiting && 
        <Novel
          key={docRoomId}
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
    </div>
  );
}
export default NovelEditor;
