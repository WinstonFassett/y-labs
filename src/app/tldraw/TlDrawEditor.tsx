import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import {
  Tldraw,
  createTLStore,
  defaultShapeUtils,
  getUserPreferences,
  setUserPreferences
} from "@tldraw/tldraw";
import { useEffect, useState } from "react";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { getDocLoadState } from "@/app/shared/store/doc-loader";
import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useYjsTlDrawStore } from "./use-yjs-tldraw";
import "@tldraw/tldraw/tldraw.css";

export default function TlDrawEditor({ className }: { className?: string; }) {
  const [store] = useState(() => {
    const store = createTLStore({
      shapeUtils: [...defaultShapeUtils],
    });

    return store;
  });
  const { docId, roomId, ydoc, $room } = useDocCollabStore();
  const $loader = getDocLoadState(docId, roomId);
  useStore($loader);
  useStore($loader.$offline.$enabled);
  const persister = useStore($loader.$offline.$persister);
  const provider = $room?.provider;
  const tld = useYjsTlDrawStore({
    yDoc: ydoc,
    store,
    name: "tldraw",
    persister,
    provider,
  });
  const [theme] = useTheme();
  const isDark = theme === "dark";
  useEffect(() => {
    const tlPrefs = getUserPreferences();

    if (tlPrefs.isDarkMode !== isDark) {
      setUserPreferences({ ...tlPrefs, isDarkMode: isDark });
    }
  }, [isDark]);

  return (
    <div className={cn(className, "flex-1 flex flex-col")}>

      {tld.status === "loading" && (
        <div className="flex-1 flex items-center justify-center">
          Loading...
        </div>
      )}

      {!!tld && (
        <div className="tldraw__editor flex-1">
          <Tldraw store={tld} />
        </div>
      )}
    </div>
  );
}
