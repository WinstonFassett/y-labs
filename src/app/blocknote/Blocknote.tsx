import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import type { XmlFragment } from "yjs";
import "./Blocknote.css";
import { useEffect, useMemo } from "react";
import { user } from "../shared/store/local-user";
import { useStore } from "@nanostores/react";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { cn } from "@/lib/utils";
import { getBlocknoteShares } from "./blocknote-shares";
import { useDocEditor } from "../shared/useDocEditor";

export interface BlocknoteProps {
  autofocus?: boolean;
  className?: string;
}

export function Blocknote(
  { autofocus, className } = {} as BlocknoteProps,
) {

  const {
    provider,
    currentDoc,
    autofocusDoc,
    loaded,
    docEditorKey,
    readOnly
  } = useDocEditor();

  const { blocknote: fragment } = useMemo(() => getBlocknoteShares(currentDoc), [currentDoc])

  
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
  }, [fragment, u]);
  window.editor = editor;
  useEffect(() => {
    if (autofocusDoc) {
      editor.focus();
    }
  }, [autofocusDoc]);
  return (<div className={cn('flex-1', readOnly && 'bg-muted transition-colors')}>
    <BlockNoteView key={docEditorKey} editor={editor} autoFocus={autofocusDoc} className={cn('flex-1', className)} />
  </div>
  );
}

export default Blocknote;
