import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { map, type MapStore } from "nanostores";

export interface DocRoomConfigFields {
  enabled: boolean;
  encrypt: boolean;
  password: string | undefined;
}

const FieldDefaults: DocRoomConfigFields = {
  enabled: true,
  encrypt: false,
  password: undefined,
};

export const roomConfigsByDocId = map(
  {} as Record<string, MapStore<DocRoomConfigFields>>,
);

export const latestDocRoom = map({} as Record<string, string>);

const docRoomConfigsT = mapTemplate(
  (
    id: string,
    docId: string,
    roomId: string,
    fields: DocRoomConfigFields = FieldDefaults,
  ) => map(FieldDefaults),
  (store, id, docId, roomId, fields = FieldDefaults) => {
    store.set(fields);
    roomConfigsByDocId.setKey(docId, store);
    latestDocRoom.setKey(docId, roomId);
    return () => {
      roomConfigsByDocId.setKey(id, undefined as any);
    };
  },
);
export function getDocRoomConfig(
  docId: string,
  roomId: string,
  fields?: DocRoomConfigFields,
) {
  const docRoomId = getDocRoomId(docId, roomId);
  const $model = docRoomConfigsT(docRoomId, docId, roomId, fields);
  return $model;
}

export function getDocRoomId(docId: string, roomId: string) {
  return `${docId}-${roomId}`;
}
