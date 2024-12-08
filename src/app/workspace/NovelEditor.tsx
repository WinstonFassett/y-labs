import { getDocLoadState } from "@/app/shared/store/doc-loader";
import { user } from "@/app/shared/store/local-user";
import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';

import Novel from "@/app/novel/Novel";
import { getDocRoomId } from "../shared/store/doc-room-config";

export default function NovelEditor() {
  const { docId, ydoc, $room, roomId } = useDocCollabStore();
  const docRoomId = getDocRoomId(docId, roomId);
  const loadState = useStore(getDocLoadState(docId, roomId));
  const fragment = ydoc.getXmlFragment("novel");
  const provider = $room?.get().provider;
  const ready = loadState === "loaded";
  const providerReady = roomId ? !!provider : true;
  const u = user.get();
  const waiting = !providerReady && !ready ;
  const meta = ydoc.getMap<any>("meta");
  const title = (meta.get("title") as string) || "";
  const autofocus = ready && !!title  
  return (
    <div className="min-h-full flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
      {!ready && <div>Loading...</div>}
      {ready && 
        <Novel
          key={docRoomId}
          autofocus={autofocus}
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
