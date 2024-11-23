import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import type { XmlFragment } from "yjs";
import "./Blocknote.css";
import { useEffect } from "react";
import { user } from "../shared/store/local-user";
import { useStore } from "@nanostores/react";

export interface BlocknoteProps {
  provider: any;
  fragment: XmlFragment;
  autofocus?: boolean;
  className?: string;
}

export function Blocknote(
  { provider, fragment, autofocus, className } = {} as BlocknoteProps,
) {
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
    <BlockNoteView editor={editor} autoFocus={true} className={className} />
  );
}

export default Blocknote;
