import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import {
  Tldraw,
  createTLStore,
  defaultShapeUtils,
  getUserPreferences,
  setUserPreferences,
  type TLStoreWithStatus
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useEffect, useMemo } from "react";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { getDocIdbStore } from "../shared/store/local-yjs-idb";
import { useDocEditor } from "../shared/useDocEditor";
import "./style.css";
import { TLDrawCollabRoom } from "./yjs-tldraw";
import { Loading } from "@/components/ui/loading";

export default function TlDrawEditor({ className }: { className?: string; }) {
  const { docId, currentDoc, provider, loaded, loadState, docEditorKey, readOnly } = useDocEditor({ type: 'tldraw'});
  
  useEffect(() => {
    document.body.classList.add("tldraw");
    return () => {
      document.body.classList.remove("tldraw");
    }
  }, [])

  const store = useMemo(() => createTLStore({
    shapeUtils: [...defaultShapeUtils],
  }), [currentDoc]);

  const storeWithStatus = useMemo<TLStoreWithStatus>(() => {
    return {
      status: (!loaded ? "loading" : 'synced-remote') as any,
      connectionStatus: loaded ? 'online' : 'offline',
      store
    }
  }, [store, loaded, currentDoc])

  const loading = !loaded || storeWithStatus.status === "loading";

  const $offlineStore = getDocIdbStore(docId!)
  const persister = useStore($offlineStore.$persister);

  useEffect(() => {
    const collab = new TLDrawCollabRoom(
      store,
      currentDoc,
      provider,
      persister,
      'tldraw'
    )
    return () => {
      collab.destroy()
    }
  }, [store, provider, currentDoc, persister])

  const [theme] = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    ensureTheme(isDark);
  }, [])

  useEffect(() => {
    ensureTheme(isDark)
  }, [isDark]);

  return (
    <div className={cn(className, "flex-1 flex flex-col max-h-screen overflow-hidden")}>
      {loading && (
        <Loading />
      )}

      {!loading && (
        <div className={cn("tldraw__editor flex-1", readOnly && 'bg-muted')}>
          <Tldraw key={docEditorKey} store={storeWithStatus} 
            onMount={(editor) => {
              if (readOnly) {
                editor.updateInstanceState({ isReadonly: true })    
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

function ensureTheme(isDark: boolean) {
  const tlPrefs = getUserPreferences();
  if (tlPrefs.isDarkMode !== isDark) {
    setUserPreferences({ ...tlPrefs, isDarkMode: isDark });
  }
}