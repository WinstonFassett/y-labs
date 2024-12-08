import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import type { XmlFragment } from "yjs";
import "./Blocknote.css";
import { useEffect } from "react";
import { user } from "../shared/store/local-user";
import { useStore } from "@nanostores/react";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { cn } from "@/lib/utils";
import { getBlocknoteShares } from "./blocknote-shares";

export interface BlocknoteProps {
  autofocus?: boolean;
  className?: string;
}

export function Blocknote(
  { autofocus, className } = {} as BlocknoteProps,
) {
  const { docId, ydoc, $room, roomId } = useDocCollabStore();
  const fragment = getBlocknoteShares(ydoc).blocknote;
  const provider=$room?.get().provider
  

  const theme = "dark"; // useStore(store.theme)
  const u = useStore(user);
  const editor = useBlockNote({
    collaboration: {
      provider,
      fragment,
      user: {
        name: u.username,
        userName: u.username,
        color: u.color,
      },
    },
  });
  window.editor = editor;
  useEffect(() => {
    if (autofocus) {
      editor.focus();
    }
  }, [autofocus]);
  return (
    <BlockNoteView editor={editor} autoFocus={true} className={cn('flex-1', className)} />
  );
}

export default Blocknote;
