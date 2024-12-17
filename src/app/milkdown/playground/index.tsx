// import Loading from "@/components/loading";
import clsx from "clsx";
import { useAtomCallback } from "jotai/utils";
// import dynamic from "next/dynamic";
import { type FC, useCallback, useState } from "react";
import { cmAPI, crepeAPI, focus } from "./atom";
import { Loading } from "@/components/ui/loading";
import PlaygroundMilkdown from "./Crepe";
import ControlPanel from "./ControlPanel";
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'
import "@milkdown/crepe/theme/common/style.css";

// We have some themes for you to choose
import "@milkdown/crepe/theme/frame.css";
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
import "./styles/crepe.css";
// import "@milkdown/crepe/theme/common/style.css";

// const PlaygroundMilkdown = dynamic(() => import("./Crepe"), {
//   ssr: false,
//   loading: () => <Loading />,
// });

// const ControlPanel = dynamic(() => import("./ControlPanel"), {
//   ssr: false,
//   loading: () => <Loading />,
// });

export default function Dual ({ doc, awareness }: { doc: Y.Doc, awareness?: Awareness }) {
  const [expand, setExpand] = useState(false);
  console.log('awareness', awareness)
  const onMilkdownChange = useAtomCallback(
    useCallback((get, _set, markdown: string) => {
      const cmAPIValue = get(cmAPI);
      const lock = get(focus) === "cm";
      if (lock) return;

      cmAPIValue.update(markdown);
    }, [])
  );

  const onCodemirrorChange = useAtomCallback(
    useCallback((get, _set, getCode: () => string) => {
      const value = getCode();
      const crepeAPIValue = get(crepeAPI);
      crepeAPIValue.update(value);
    }, [])
  );

  return (
    <>
      <div
        className={clsx(
          "h-[calc(100vh-72px)]",
          expand
            ? "expanded relative col-span-2 mx-auto mt-16 mb-24 flex !h-fit min-h-[80vh] w-full max-w-5xl flex-col border-gray-300 dark:border-gray-600"
            : "fixed bottom-0 left-0 w-1/2"
        )}
      >
        <PlaygroundMilkdown onChange={onMilkdownChange} doc={doc} awareness={awareness}  />
      </div>
      <div
        className={clsx(
          "border-l border-gray-300 dark:border-gray-600 h-[calc(100vh-72px)]",
          expand ? "!h-0" : "fixed bottom-0 right-0 w-1/2"
        )}
      >
        <ControlPanel
          hide={expand}
          setHide={setExpand}
          onChange={onCodemirrorChange}
        />
      </div>
    </>
  );
};