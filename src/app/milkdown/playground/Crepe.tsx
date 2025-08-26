import { useTheme } from "@/lib/astro-tailwind-themes/useTheme";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx, parserCtx } from "@milkdown/kit/core";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { Slice } from "@milkdown/kit/prose/model";
import { Selection } from "@milkdown/kit/prose/state";
import { getMarkdown } from "@milkdown/kit/utils";
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { useAtom, useSetAtom } from "jotai";
import throttle from "lodash.throttle";
import { type FC, type MutableRefObject, useLayoutEffect, useRef } from "react";
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';
import { crepeAPI, markdown } from "./atom";
import { encode } from "./share";
import { useToast } from "./toast";
import "./styles/crepe.css"

interface MilkdownProps {
  onChange: (markdown: string) => void;
  doc: Y.Doc;
  shareName?: string;
  awareness?: Awareness;
}

const CrepeEditor: FC<MilkdownProps> = ({ onChange, doc, awareness, shareName = "milkdown" }) => {
  const crepeRef = useRef<Crepe>(null);
  const [theme] = useTheme()
  const darkMode = theme === "dark";
  const divRef = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const toast = useToast();
  // const content = useAtomValue(markdown);
  const [content, _setMarkdown] = useAtom(markdown)
  // const getMarkdown = useAtomCallback(useCallback((get, set) => {
  //   return get(markdown)
  // }, []))
  const setCrepeAPI = useSetAtom(crepeAPI);
  const collabRef = useRef({ doc, awareness })
  collabRef.current = { doc, awareness }
  useLayoutEffect(() => {
    if (!divRef.current || loading.current) return;
    
    loading.current = true;
    const crepe = new Crepe({
      root: divRef.current,
      defaultValue: content,
      featureConfigs: {
        [Crepe.Feature.CodeMirror]: {
          // theme: darkMode ? undefined : eclipse,
        },
        [Crepe.Feature.LinkTooltip]: {
          onCopyLink: () => {
            toast("Link copied", "success");
          },
        },
      },
    });

    crepe.editor
      .use(collab)
    crepe.editor
      .config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated(
          throttle((_, markdown) => {
            onChange(markdown);
          }, 200)
        );
        
      })
      .use(listener);

    crepe.create().then(async () => {
      const { doc, awareness } = collabRef.current
      // const theAwareness = awareness
      if (doc) {
        // ctx.set(defaultValueCtx, template);      
        await crepe.editor
        .action(async (ctx) => {
          // await ctx.wait(CollabReady)
          const collabService = ctx.get(collabServiceCtx);
          collabService
            // bind doc and awareness
            .bindDoc({
              getXmlFragment: () => doc.getXmlFragment(shareName)
            } as any)
          if (awareness) {
            collabService
              .setAwareness(awareness)
          }
          // connect yjs with milkdown
          collabService.connect();
          // const md = getMarkdown()(ctx)
          const md = crepe.editor.action(getMarkdown());
          onChange(md);
        });
      }
      (crepeRef as MutableRefObject<Crepe>).current = crepe;
      loading.current = false;
    });

    setCrepeAPI({
      loaded: true,
      onShare: () => {
        const content = crepe.editor.action(getMarkdown());
        const base64 = encode(content);

        const url = new URL(location.href);
        url.searchParams.set("text", base64);
        navigator.clipboard.writeText(url.toString()).then(() => {
          toast("Share link copied.", "success");
        });
        window.history.pushState({}, "", url.toString());
      },
      update: (markdown: string) => {
        const crepe = crepeRef.current;
        if (!crepe) return;
        crepe.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const parser = ctx.get(parserCtx);
          const doc = parser(markdown);
          if (!doc) return;
          const state = view.state;
          const selection = state.selection;
          const { from } = selection;
          let tr = state.tr;
          tr = tr.replace(
            0,
            state.doc.content.size,
            new Slice(doc.content, 0, 0)
          );
          tr = tr.setSelection(Selection.near(tr.doc.resolve(from)));
          view.dispatch(tr);
        });
      },
    });

    return () => {
      if (loading.current) return;
      crepe.destroy();
      setCrepeAPI({
        loaded: false,
        onShare: () => {},
        update: () => {},
      });
    };
  }, [doc, awareness, content, darkMode, onChange, setCrepeAPI, toast]);

  return <div className="crepe flex h-full flex-1 flex-col [&>*]:flex-1" ref={divRef} />;
};

export default CrepeEditor;
