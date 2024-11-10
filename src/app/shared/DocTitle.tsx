import { Input } from "@/components/ui/input";
import {
  useEffect,
  useState,
  type ChangeEventHandler,
  type ChangeEvent,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import type { YMapEvent } from "yjs";
import { useDocCollabStore } from "./useDocCollabStore";

const initialTitle = document.title;
const setWindowTitle = (title: string) =>
  (document.title = `${title || "Untitled"} - ${initialTitle}`);

export function DocTitle() {
  const { ydoc } = useDocCollabStore();
  const meta = ydoc.getMap<any>("meta");
  const title = (meta.get("title") as string) || "";
  const [pendingTitle, setPendingTitle] = useState(title);

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
  return (
    <>
      <Input
        placeholder={"Add a Title"}
        value={pendingTitle}
        size="sm"
        className="text-xl text-center bg-transparent border-transparent hover:border-border"
        onBlur={(e) => {
          updateTitle(e as ChangeEvent<HTMLInputElement>);
        }}
        onChange={(e) => {
          setPendingTitle(e.target.value);
          onChangeDebounced(e);
        }}
      />
    </>
  );
}
