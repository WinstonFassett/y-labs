import { getDocLoadState } from "@/app/shared/store/doc-loader";
import { user } from "@/app/shared/store/local-user";
import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import {Collaboration} from "@/app/shared/TiptapCollaborationExtension";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';

import Novel from "@/app/novel/Novel";
import { getDocRoomId } from "../shared/store/doc-room-config";
import { getDocVersionsStoreByDocEditor } from "../shared/store/doc-versions";
import { useStoreIfPresent } from "../shared/useStoreIfPresent";
import { useParams } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { useDocEditorMode } from "../shared/useDocEditorMode";
import { cn } from "@/lib/utils";

export default function NovelEditor() {
  const { type } = useParams<{ type: string }>();
  const { docId, ydoc, $room, roomId } = useDocCollabStore();
  const mode = useDocEditorMode()

  const versionsStore = getDocVersionsStoreByDocEditor(docId, type);
  console.log({versionsStore})
  const versionInfoMaybe = useStoreIfPresent(versionsStore);
  const versionId = versionInfoMaybe?.displayVersionId
  
  const isLatestVersion = useStoreIfPresent(
    versionsStore?.$isLatestVersion
  ) ?? false;

  const isVersionReplay = mode === 'versions' && !!versionId && !isLatestVersion;

  const replayDoc = useStoreIfPresent(
    isVersionReplay && 
    versionsStore?.$replayDoc
  )
  
  const isLive = !isVersionReplay;

  console.log({ isLive, isLatestVersion})
  
  const docRoomId = getDocRoomId(docId, roomId);
  const loadState = useStore(getDocLoadState(docId, roomId));
  
  const isReplay = !isLive && !!versionId;
  const docToUse = isReplay ? replayDoc : ydoc;

  const fragment = docToUse.getXmlFragment("novel");
  const provider = $room?.get().provider;

  const ready = loadState === "loaded";
  const providerReady = roomId ? !!provider : true;

  const u = user.get();
  const waiting = !providerReady && !ready ;

  const meta = docToUse.getMap<any>("meta");
  const title = (meta.get("title") as string) || "";
  const autofocus = ready && !!title 

  const key = docRoomId + (isReplay ? `-${versionId}` : "");
  
  const readOnly = isReplay || !providerReady;

  return (
    <div className={cn("min-h-full flex-1 flex flex-col max-w-3xl mx-auto w-full p-4", 
      readOnly && 'bg-muted transition-colors')}>
      {!ready && <div>Loading...</div>}
      
      {ready && 
        <Novel
          key={key}
          className={cn(readOnly && 'bg-muted')}
          readOnly={readOnly}
          autofocus={autofocus}
          extensions={[
            TextStyle as any, 
            Color,
            Highlight.configure({ multicolor: true }),
            Collaboration.configure({
              fragment,
            }),
            ...(provider
              ? 
              [
                  CollaborationCursor.configure({
                    provider,
                    user: provider && {
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
