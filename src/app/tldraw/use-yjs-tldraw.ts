import type { TLStore, TLStoreWithStatus } from "@tldraw/tldraw";

import type { Observable } from "lib0/observable.js";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { TLDrawCollabRoom, createDisposer, listenOnce } from "./yjs-tldraw";

interface Props {
  yDoc: Y.Doc;
  store: TLStore;
  name?: string;
  provider?: Observable<any>;
  persister?: any;
}

export function useYjsTlDrawStore({
  yDoc,
  name = "tldraw",
  store,
  provider,
  persister,
}: Props) {
  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });
  const { collab, dispose } = useMemo(() => {
    const collab = new TLDrawCollabRoom(
      store,
      yDoc,
      provider,
      persister,
      "tldraw",
    );
    const dispose = createDisposer(
      listenOnce(yDoc, "tldraw-ready", (name) => {
        setStoreWithStatus({
          status: "synced-remote",
          store,
          connectionStatus: "online",
        });
      }),
      persister &&
        listenOnce(persister, "synced", (synced: boolean) => {
          if (!yDoc.isSynced) {
            Promise.resolve().then(() => {
              yDoc.emit("synced", [true]);
            });
          }
        }),
      listenOnce(yDoc, "synced", (synced: boolean) => {
        setStoreWithStatus({
          store,
          status: "synced-remote",
          connectionStatus: "online",
        });
      }),
    );
    return {
      collab,
      dispose,
    };
  }, [yDoc, name, provider, persister, store]);

  useEffect(() => {
    return dispose;
  }, [collab]);

  return storeWithStatus;
}
