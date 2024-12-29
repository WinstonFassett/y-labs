import { corestore } from '@/app/shared/corestore';
import { atom, computed } from 'nanostores';
import Hyperdrive from 'hyperdrive';
import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';
import { parseHyperdrivePermalink } from '../../../lib/parseHyperdrivePermalink';
import b4a from 'b4a'
import Hyperbee from 'hyperbee';

export const collabStore = corestore.namespace('collab');

const dbCore = collabStore.get({ name: 'db' });

export const db = new Hyperbee(dbCore, { keyEncoding: 'utf-8', valueEncoding: 'binary' })

console.log('db', db)


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

export function getAttachmentDriveStore(permalinkAsId: string) {
  const { keyStr, path, key } = parseHyperdrivePermalink(permalinkAsId)!;
  console.log('getting attachment drive', keyStr, 'for', path);
  
  // ensure the key is in the db
  db.put(permalinkAsId, key, { cas: compareAndSwap })
  
  return attachmentDriveT(keyStr, path);
}
export function getAttachmentDrive(permalinkAsId: string) {
  return getAttachmentDriveStore(permalinkAsId).value;
}

export function setAttachmentDrive(permalinkAsId: string, drive: Hyperdrive) {
  const { keyStr, key } = parseHyperdrivePermalink(permalinkAsId)!;
  // attachmentDriveT.cache[keyStr] = atom(drive);
  console.log('set attachment drive', keyStr, drive);
  db.put(keyStr, key)
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

function compareAndSwap (prev, next) {
  // You can use same-data or same-object lib, depending on the value complexity
  return prev.value !== next.value
}