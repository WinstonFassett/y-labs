import Hyperdrive from 'hyperdrive';
import serialize from 'json-sorted-stringify';
import b4a from 'b4a';

export async function getHyperdrivePermalink(drive: Hyperdrive, path: string) {
  const version = drive.version;
  const hypercore = drive.core;
  const entry = await drive.entry(path);
  console.log('entry', entry);
  const { blob } = entry.value;
  const blobKey = serialize(blob);
  console.log('blobKey', blobKey);
  const driveKey = b4a.toString(drive.key, 'hex');
  console.log('driveKey', driveKey);
  // const encodedBlobKey = Buffer.from(drive.key).toString('base64');
  return `hyper://${driveKey}${path}/v/${version}/${blobKey}`;
}
export function parseHyperdrivePermalink(permalink: string) {
  const parts = permalink.split('//');
  if (parts.length !== 2) {
    return null;
  }
  const [protocol, rest] = parts;
  if (protocol !== 'hyper:') {
    return null;
  }
  const [keyStr, path, _v, version, blobKey] = rest.split('/');
  const blob = JSON.parse(blobKey);
  const key = b4a.from(keyStr, 'hex');
  return { key, keyStr, path, version, blob };
}
