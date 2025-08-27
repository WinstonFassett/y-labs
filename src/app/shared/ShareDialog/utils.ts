import { buildUrl } from "@/lib/build-url";
import type { DocRoomConfigFields } from "../store/doc-room-config";

export function generateSharingLink(config: DocRoomConfigFields, type?: string) {
  const { docId, roomId, password, encrypt } = config;    
  const base = [
    window.location.protocol,
    "//",
    window.location.host,
    window.location.pathname,
    '#'
  ].join("");
  
  return buildUrl(
    [base, "edit", docId, type],
    {
      roomId,
      encrypt: encrypt ? "true" : undefined,
      x: encrypt ? password : undefined,
    }
  );
}

export function generateDocRoomRouterLink(config: DocRoomConfigFields, type?: string) {  
  const { docId, roomId, encrypt } = config;  
  return buildUrl(
    ["/edit", docId, type],
    {
      roomId,
      encrypt: encrypt ? "true" : undefined,
    }
  );
}