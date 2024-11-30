import { Input } from "@/components/ui/input";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import type { YMapEvent } from "yjs";
import { useDocCollabStore } from "./useDocCollabStore";
import { getDocLoadState } from "./store/doc-loader";
import { useStore } from "@nanostores/react";

const initialTitle = document.title;
const setWindowTitle = (title: string) =>
  (document.title = `${title || "Untitled"} - ${initialTitle}`);

export function DocTitle() {
  const { ydoc, docId, roomId } = useDocCollabStore();
  const meta = ydoc.getMap<any>("meta");
  const title = (meta.get("title") as string) || "";
  const [pendingTitle, setPendingTitle] = useState(title);
  useEffect(() => {
    return () => {
      onChangeDebounced.cancel();
    }
  },[])
  // update document.title when title changes
  useEffect(() => {
    setWindowTitle(title);
  }, [title]);

  // track changes to meta.title
  useEffect(() => {
    const onChange = (ev: YMapEvent<any>) => {
      if (ev.keysChanged.has("title")) {
        setPendingTitle(ev.target.get("title"));
      }
    };
    meta.observe(onChange);
    return () => {
      meta.unobserve(onChange);
    };
  }, [meta]);

  const updateTitle: ChangeEventHandler<HTMLInputElement> = (e) => {
    meta.set("title", e.target.value);
    setWindowTitle(e.target.value);
  };
  const onChangeDebounced = useDebouncedCallback(updateTitle, 1000);
  const hasTitle = title.length > 0;
  const loadState = useStore(getDocLoadState(docId!, roomId!));
  const isLoaded = loadState === "loaded";
  return (
    <>{
      !isLoaded ? <div></div> : (
        <Input
          key={docId}
          autoFocus={!hasTitle}
          placeholder={"Add a Title"}
          value={pendingTitle}
          // size="sm"
          className="text-lg text-center bg-transparent border-transparent hover:border-border"
          onBlur={(e) => {
            updateTitle(e as ChangeEvent<HTMLInputElement>);
          }}
          onChange={(e) => {
            setPendingTitle(e.target.value);
            onChangeDebounced(e);
          }}
        />        
      )
    }
    </>
  );
}
