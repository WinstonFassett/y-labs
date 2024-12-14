import type {
  SerializedSchema,
  TLInstancePresence,
  TLRecord,
  TLStore,
} from "@tldraw/tldraw";
import {
  InstancePresenceRecordType,
  computed,
  createPresenceStateDerivation,
  defaultUserPreferences,
  getUserPreferences,
  react,
  setUserPreferences,
} from "@tldraw/tldraw";
import { Observable, ObservableV2 } from "lib0/observable.js";
import { Awareness } from "y-protocols/awareness";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import { user } from "../shared/store/local-user";

export class TLDrawCollabRoom extends ObservableV2<any> {
  constructor(
    public store: TLStore,
    public yDoc: Y.Doc,
    public provider?: any,
    public persister?: any,
    public name: string = "tldraw",
  ) {
    super();
    this.init();
  }
  init() {
    const { store, yDoc, provider, persister, name } = this;
    this.destroy = createDisposer(
      bindToYDoc(store, yDoc, name, {}, provider, persister),
    );
  }
}

export function bindToYDoc(
  store: TLStore,
  yDoc: Y.Doc,
  name = "tldraw",
  { shapeUtils = [] }: { shapeUtils?: any[] } = {},
  provider?: any,
  persister?: any,
) {
  const yArr = yDoc.getArray<{ key: string; val: TLRecord }>(`${name}`);
  const yStore = new YKeyValue(yArr);
  const meta = yDoc.getMap<SerializedSchema>(`${name}_meta`);
  const loaded = yDoc.isLoaded;
  const onLoaded = () => {
    const isNew = yArr.length === 0;
    if (isNew) {
      initializeNewTldrawStore();
    } else {
      applySchemaMigration();
    }
    Promise.resolve().then(() => {
      yDoc.emit("tldraw-ready", [name]);
    });
  }
  if (loaded) {
    onLoaded();
  }
  const dispose = createDisposer(
    effectSyncTlDrawToYDoc(),
    effectSyncYDocToTlDraw(),
    provider?.awareness && effectSyncAwareness(provider.awareness),
    !loaded ? listenOnce(yDoc, "load", onLoaded) : undefined,
    provider &&
      listen(provider, "synced", (synced) => {
        if (synced && !yDoc.isLoaded) {
          yDoc.emit("load", []); // change to synced
        } else {
          applySchemaMigration();
        }
      }),
  );


  function effectSyncTlDrawToYDoc() {
    return createDisposer(
      store.listen(
        function syncStoreChangesToYjsDoc({ changes }) {
          yDoc.transact(() => {
            Object.values(changes.added).forEach((record) => {
              yStore.set(record.id, record);
            });

            Object.values(changes.updated).forEach(([_, record]) => {
              yStore.set(record.id, record);
            });

            Object.values(changes.removed).forEach((record) => {
              yStore.delete(record.id);
            });
          });
        },
        { source: "user", scope: "document" }, // only sync user's document changes
      ),
    );
  }

  function effectSyncYDocToTlDraw() {
    return createDisposer(
      listen(
        yStore,
        "change",
        function handleChange(
          changes: Map<
            string,
            | { action: "delete"; oldValue: TLRecord }
            | { action: "update"; oldValue: TLRecord; newValue: TLRecord }
            | { action: "add"; newValue: TLRecord }
          >,
          transaction: Y.Transaction,
        ) {
          if (transaction.local) return;

          const toRemove: TLRecord["id"][] = [];
          const toPut: TLRecord[] = [];

          changes.forEach((change, id) => {
            switch (change.action) {
              case "add":
              case "update": {
                const record = yStore.get(id)!;
                toPut.push(record);
                break;
              }
              case "delete": {
                toRemove.push(id as TLRecord["id"]);
                break;
              }
            }
          });

          // put / remove the records in the store
          store.mergeRemoteChanges(() => {
            if (toRemove.length) store.remove(toRemove);
            if (toPut.length) store.put(toPut);
          });
        },
      ),
    );
  }

  function effectSyncAwareness(awareness: Awareness) {
    const unsubs: (() => void)[] = [];
    const yClientId = awareness.clientID.toString();
    setUserPreferences({ id: yClientId });

    const { username, color } = user.get();

    const userPreferences = computed<{
      id: string;
      color: string;
      name: string;
    }>("userPreferences", () => {
      const user = getUserPreferences();
      return {
        id: user.id,
        color: color ?? user.color ?? defaultUserPreferences.color,
        name: username ?? user.name ?? defaultUserPreferences.name,
      };
    });

    // const unsubUser = user.subscribe((user) => {
    //   awareness.setLocalStateField("presence", user);
    // });

    // Create the instance presence derivation
    const presenceId = InstancePresenceRecordType.createId(yClientId);
    const presenceDerivation = createPresenceStateDerivation(
      userPreferences,
      presenceId,
    )(store);

    // Set our initial presence from the derivation's current value
    awareness.setLocalStateField("presence", presenceDerivation.get());

    // When the derivation change, sync presence to to yjs awareness
    unsubs.push(
      react("when presence changes", () => {
        const presence = presenceDerivation.get();
        requestAnimationFrame(() => {
          awareness.setLocalStateField("presence", presence);
        });
      }),
    );

    // Sync yjs awareness changes to the store
    const handleYjsAwarenessUpdate = (update: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      const states = awareness.getStates() as Map<
        number,
        { presence: TLInstancePresence }
      >;

      const toRemove: TLInstancePresence["id"][] = [];
      const toPut: TLInstancePresence[] = [];

      // Connect records to put / remove
      for (const clientId of update.added) {
        const state = states.get(clientId);
        if (state?.presence && state.presence.id !== presenceId) {
          toPut.push(state.presence);
        }
      }

      for (const clientId of update.updated) {
        const state = states.get(clientId);
        if (state?.presence && state.presence.id !== presenceId) {
          toPut.push(state.presence);
        }
      }

      for (const clientId of update.removed) {
        toRemove.push(InstancePresenceRecordType.createId(clientId.toString()));
      }

      // put / remove the records in the store
      store.mergeRemoteChanges(() => {
        if (toRemove.length) store.remove(toRemove);
        if (toPut.length) store.put(toPut);
      });
    };

    unsubs.push(listen(awareness, "update", handleYjsAwarenessUpdate));

    return () => unsubs.forEach((d) => d());
  }

  function applySchemaMigration() {
    // console.log("MIGRATING", meta, yDoc);
    // Replace the store records with the yjs doc records
    const ourSchema = store.schema.serialize();
    const theirSchema = meta.get("schema");
    if (!theirSchema) {
      throw new Error("No schema found in the yjs doc");
    }

    const records = yStore.yarray.toJSON().map(({ val }) => val);

    const migrationResult = store.schema.migrateStoreSnapshot({
      schema: theirSchema,
      store: Object.fromEntries(records.map((record) => [record.id, record])),
    });
    if (migrationResult.type === "error") {
      // if the schema is newer than ours, the user must refresh
      console.error(migrationResult.reason);
      window.alert("The schema has been updated. Please refresh the page.");
      return;
    }

    yDoc.transact(() => {
      // delete any deleted records from the yjs doc
      for (const r of records) {
        if (!migrationResult.value[r.id]) {
          yStore.delete(r.id);
        }
      }
      for (const r of Object.values(migrationResult.value) as TLRecord[]) {
        yStore.set(r.id, r);
      }
      meta.set("schema", ourSchema);
    });

    store.loadSnapshot({
      store: migrationResult.value,
      schema: ourSchema,
    });
  }

  function initializeNewTldrawStore() {
    yDoc.transact(() => {
      for (const record of store.allRecords()) {
        yStore.set(record.id, record);
      }
      meta.set("schema", store.schema.serialize());
    });
  }

  return dispose;
}

export function listen<A extends any[] = any[]>(
  obs: Observable<any>,
  type: string,
  cb: (...args: A) => void,
) {
  obs.on(type, cb);
  return () => {
    obs.off(type, cb);
  };
}

export function listenOnce(
  obs: Observable<any>,
  type: string,
  cb: (v: any) => void,
) {
  obs.once(type, cb);
  return () => {
    obs.off(type, cb);
  };
}

export function createDisposer(
  ...disposers: ((() => void) | void | undefined)[]
) {
  let disposed = false;
  return () => {
    if (disposed) return;
    disposers.forEach((d) => d?.());
    disposed = true;
  };
}
