import { corestore } from "@/app/shared/corestore";
import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import b4a from "b4a";
import Hyperbee from "hyperbee";
import Hyperdrive from "hyperdrive";
import { atom, computed } from "nanostores";
import { parseHyperdrivePermalink } from "../../../lib/parseHyperdrivePermalink";

export const collabStore = corestore.namespace("collab");

const dbCore = collabStore.get({ name: "db" });

export const db = new Hyperbee(dbCore, {
  keyEncoding: "utf-8",
  valueEncoding: "binary",
});

export const $attachmentScope = atom<string | null>(null);
const $attachmentScopeStore = computed([$attachmentScope], (scope) => {
  if (scope === null) {
    return collabStore;
  }
  return collabStore.namespace(scope);
});
const attachmentDriveT = mapTemplate((keyStr, pathHint: string) => {
  const key = b4a.from(keyStr, "hex");
  const attachmentStore = getCasStore(pathHint);
  const drive = new Hyperdrive(attachmentStore, key);
  return atom(drive);
});

export const $attachmentDrivesById = attachmentDriveT.$cache;

export function getAttachmentDriveStore(permalinkAsId: string) {
  const { keyStr, path, key } = parseHyperdrivePermalink(permalinkAsId)!;
  // track it
  db.put(permalinkAsId, key, { cas: compareAndSwap });
  return attachmentDriveT(keyStr, path);
}
export function getAttachmentDrive(permalinkAsId: string) {
  return getAttachmentDriveStore(permalinkAsId).value;
}

export function setAttachmentDrive(permalinkAsId: string, drive: Hyperdrive) {
  const { keyStr, key } = parseHyperdrivePermalink(permalinkAsId)!;
  db.put(keyStr, key);
  attachmentDriveT.$cache.setKey(keyStr, atom(drive));
}
function getStore(scope: string[]) {
  return scope.reduce((store, name) => {
    return store.namespace(name);
  }, collabStore);
}
const CAS_KEY = "cas";
export function getCasStore(key: string) {
  return getStore([$attachmentScope.get() ?? "docs", CAS_KEY, key]);
}

function compareAndSwap(prev, next) {
  return prev.value !== next.value;
}
