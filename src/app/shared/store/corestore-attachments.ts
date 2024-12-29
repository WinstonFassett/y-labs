import { corestore } from '@/app/shared/corestore';
import { atom, computed } from 'nanostores';
import Hyperdrive from 'hyperdrive';
import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';
import { parseHyperdrivePermalink } from '../../../lib/parseHyperdrivePermalink';
import b4a from 'b4a'

export const collabStore = corestore.namespace('collab');

export const $attachmentScope = atom<string | null>(null);
const $attachmentScopeStore = computed([$attachmentScope], (scope) => {
  if (scope === null) {
    return collabStore;
  }
  return collabStore.namespace(scope);
});
const attachmentDriveT = mapTemplate(
  (keyStr, pathHint: string) => {
    const key = b4a.from(keyStr, 'hex');
    const attachmentStore = getCasStore(pathHint);
    const drive = new Hyperdrive(attachmentStore, key);
    return atom(drive);
  }
);

export const $attachmentDrivesById = attachmentDriveT.$cache

export function getAttachmentDrive(permalinkAsId: string) {
  const { keyStr, path } = parseHyperdrivePermalink(permalinkAsId)!;
  console.log('getting attachment drive', keyStr, 'for', path);
  return attachmentDriveT(keyStr, path).value;
}
export function setAttachmentDrive(permalinkAsId: string, drive: Hyperdrive) {
  const { keyStr } = parseHyperdrivePermalink(permalinkAsId)!;
  // attachmentDriveT.cache[keyStr] = atom(drive);
  console.log('set attachment drive', keyStr, drive);
  attachmentDriveT.$cache.setKey(keyStr, atom(drive));
}
// const $attachmentScopeDrive = computed([$attachmentScopeStore], (scopeStore) => {
//   return new Hyperdrive(scopeStore)
// })
function getStore(scope: string[]) {
  return scope.reduce((store, name) => {
    return store.namespace(name);
  }, collabStore);
}
const CAS_KEY = "cas";
export function getCasStore(key: string) {
  return getStore([$attachmentScope.get() ?? "docs", CAS_KEY, key]);
}
