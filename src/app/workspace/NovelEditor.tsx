import { Collaboration } from "@/lib/TiptapCollaborationExtension";
import { user } from "@/app/shared/store/local-user";
import { useStore } from "@nanostores/react";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';

import Novel from "@/app/novel/Novel";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { getNovelShares } from "../novel/novel-shares";
import { useDocEditor } from "../shared/useDocEditor";

export default function NovelEditor() {  
  const {
    provider,
    currentDoc,
    autofocusDoc,
    loaded,
    docEditorKey,
    readOnly
  } = useDocEditor();

  const { novel: fragment } = useMemo(() => getNovelShares(currentDoc), [currentDoc])

  const u = useStore(user);
  
  const extensions = useMemo(() => [
    TextStyle as any, 
    Color,
    Highlight.configure({ multicolor: true }),
    Collaboration.configure({
      fragment
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
  ].filter((x) => !!x), [fragment, provider, u]);

  return (
    <div className={cn("min-h-full flex-1 flex flex-col max-w-3xl mx-auto w-full p-4", 
      readOnly && 'bg-muted transition-colors')}>
      {!loaded && <div>Loading Novel...</div>}
      
      {loaded && 
        <Novel
          key={docEditorKey}
          className={cn(readOnly && 'bg-muted')}
          readOnly={readOnly}
          autofocus={autofocusDoc}
          extensions={extensions}
        />
      }
    </div>
  );
}
