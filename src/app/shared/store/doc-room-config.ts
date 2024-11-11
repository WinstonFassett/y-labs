import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { map, type MapStore } from "nanostores";
import { z } from "zod";

export interface DocRoomConfigFields {
  docId: string;
  roomId: string;
  enabled: boolean;
  encrypt: boolean;
  password: string | undefined;
  accessLevel: "view" | "edit";
  includePassword: boolean;
}

const FieldDefaults: DocRoomConfigFields = {
  docId: null,
  roomId: null,
  enabled: false,
  encrypt: false,
  password: undefined,
  accessLevel: "view",
  includePassword: false,
};

export const roomConfigsByDocId = map(
  {} as Record<string, MapStore<DocRoomConfigFields>>,
);

export const latestDocRoom = map({} as Record<string, string>);

export const RoomConfigSchema = z.object({
  // username: z.string().min(2).max(50),
  // id: z.string(),
  docId: z.string(),
  roomId: z.string().min(1, { message: "Required" }),
  enabled: z.boolean(),
  encrypt: z.boolean(),
  password: z.string().optional(),
  accessLevel: z.enum(["view", "edit"]),
})
.superRefine((values, ctx) => {
  if (values.encrypt && !values.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is required when encryption is enabled",
      path: ["password"],
    });
  }
})
;

const docRoomConfigsT = mapTemplate(
  (
    id: string,
    docId: string,
    roomId: string,
    fields: DocRoomConfigFields = FieldDefaults,
  ) => {
    const store = map(fields);
    return Object.assign(store, {
      docId,
      roomId,
    });
  },
  (store, id, docId, roomId, fields = FieldDefaults) => {
    roomConfigsByDocId.setKey(docId, store);
    latestDocRoom.setKey(docId, roomId);
    return () => {
      roomConfigsByDocId.setKey(id, undefined as any);
    };
  },
);
export function getDocRoomConfig(docId: string, roomId: string) {
  const docRoomId = getDocRoomId(docId, roomId);

  const $model = Object.assign(docRoomConfigsT(docRoomId, docId, roomId), {
    startSharing() {
      $model.setKey("enabled", true);
    },
    stopSharing() {
      $model.setKey("enabled", false);
    },
  });
  return $model;
}

export function getDocRoomId(docId: string, roomId: string) {
  return `${docId}-${roomId}`;
}
