import { cn } from "@/lib/utils";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useStore } from "@nanostores/react";
import { useEffect, useMemo } from "react";
import { $user } from "../shared/store/local-user";
import { useDocEditor } from "../shared/useDocEditor";
import { getBlocknoteShares } from "./blocknote-shares";
import "./Blocknote.css";

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
  const u = useStore($user);

  const editor = useBlockNote({
    collaboration: {
      provider,
      fragment,
      user: {
        name: u.username,
        userName: u.username,
        color: u.color,
      } as any,
    },
  }, [fragment, u]);
  Object.assign(window, { editor });
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
