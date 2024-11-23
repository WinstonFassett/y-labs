import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { computed, map, type MapStore } from "nanostores";
import { z } from "zod";

export interface DocRoomConfigFields {
  docId: string;
  roomId: string;
  enabled: boolean;
  encrypt: boolean;
  password?: string | undefined;
  accessLevel: "view" | "edit";
}

export const RoomConfigSchema = z.object({
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
  if (values.password) {
    // validate password
  }
})
;

const docRoomConfigsT = mapTemplate(
  (
    id: string,
    docId: string,
    roomId: string,    
  ) => {
    const store = map();
    
    const $sharingLink = computed(store, ({  roomId, password, encrypt }) => {
      return [
        window.location.protocol,
        "//",
        window.location.host,
        window.location.pathname,
        "#/edit/",
        docId,
        "?roomId=",
        roomId,
        (encrypt && password) ? `&x=${password}` : "",
      ].join("")  
    })

    return Object.assign(store, {
      docId,
      roomId,
      $sharingLink
    });
  },
  (store, id, docId, roomId) => {
    return () => {
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
