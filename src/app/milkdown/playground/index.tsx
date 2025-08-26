// import Loading from "@/components/loading";
import clsx from "clsx";
import { useAtomCallback } from "jotai/utils";
// import dynamic from "next/dynamic";
import { type FC, useCallback, useState, useEffect } from "react";
import { cmAPI, crepeAPI, focus } from "./atom";
import { Loading } from "@/components/ui/loading";
import PlaygroundMilkdown from "./Crepe";
import ControlPanel from "./ControlPanel";
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import "@milkdown/crepe/theme/common/style.css";

// We have some themes for you to choose
import "@milkdown/crepe/theme/frame.css";
import "@milkdown/crepe/theme/frame-dark.css";
// import "@milkdown/crepe/theme/frame.css";
// import "@milkdown/theme-nord";

// import "@docsearch/css";
// import "@milkdown/theme-nord";
// import "@/styles/globals.css";
// import "@/styles/docsearch.css";
// import "@/styles/prosemirror.css";
// import "@/styles/prose.css";
// import "@/styles/playground.css";
// import "@/styles/toast.css";
// import "@/styles/liquid.css";
import './styles/collab.css'
// import "@milkdown/crepe/theme/common/style.css";

// const PlaygroundMilkdown = dynamic(() => import("./Crepe"), {
//   ssr: false,
//   loading: () => <Loading />,
// });

// const ControlPanel = dynamic(() => import("./ControlPanel"), {
//   ssr: false,
//   loading: () => <Loading />,
// });

export default function Dual ({ doc, awareness, shareName = "milkdown" }: { doc: Y.Doc, awareness?: Awareness, shareName?: string }) {
  const [expand, setExpand] = useState(false);
  const onMilkdownChange = useAtomCallback(
    useCallback((get, _set, markdown: string) => {
      const cmAPIValue = get(cmAPI);
      const lock = get(focus) === "cm";
      if (lock) return;

      cmAPIValue.update(markdown);
    }, [])
  );
  // useEffect(() => {
  //   const initialContent = doc.getXmlFragment('prosemirror').toString()
  //   console.log('initialContent', initialContent)
  //   onMilkdownChange(initialContent)
  // }, [onMilkdownChange])

  const onCodemirrorChange = useAtomCallback(
    useCallback((get, _set, getCode: () => string) => {
      const value = getCode();
      const crepeAPIValue = get(crepeAPI);
      crepeAPIValue.update(value);
    }, [])
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <PanelGroup className="thePanels flex-1" direction="horizontal">
        <Panel>
          <PlaygroundMilkdown onChange={onMilkdownChange} doc={doc} shareName={shareName}  awareness={awareness}  />
        </Panel>
        <PanelResizeHandle className="w-1 bg-muted" />
        <Panel>
          <ControlPanel
            hide={expand}
            setHide={setExpand}
            onChange={onCodemirrorChange}
          />
        </Panel>
      </PanelGroup>      
    </div>
  )

  return (
    <div className="h-dvh overflow-hidden relative">
      <div
        className={clsx(
          "pt-14",
          expand
            ? "expanded relative col-span-2 mx-auto mt-16 mb-24 flex !h-fit min-h-[80vh] w-full max-w-5xl flex-col border-gray-300 dark:border-gray-600"
            : "fixed bottom-0 top-0 left-0 w-1/2"
        )}
      ></div>
      <div
        className={clsx(
          "pt-14 border-l border-gray-300 dark:border-gray-600",
          expand ? "!h-0" : "fixed bottom-0 top-0 right-0 w-1/2"
        )}
      >
        
      </div>
    </div>
  );
};