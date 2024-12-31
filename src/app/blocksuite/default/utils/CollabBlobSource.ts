import { type BlobSource } from '@blocksuite/sync';
import Hyperdrive from 'hyperdrive';
import { collabStore, getAttachmentDrive, getCasStore, setAttachmentDrive } from '../../../shared/store/corestore-attachments';
import { getHyperdrivePermalink, parseHyperdrivePermalink } from '../../../../lib/parseHyperdrivePermalink';
import { readBlobFromHyperdrive, writeBlobToHyperdrive } from '../../../../lib/writeBlobToHyperdrive';

export class HyperdriveBlobSource implements BlobSource {
  name: string;
  readonly: boolean;
  ready?: Promise<void>;
  constructor(name: string) {
    this.name = name;
    this.readonly = false;
  }
  async _init () {
    if (!this.ready) {      
      this.ready = collabStore.ready();
    }
    await this.ready
  }
  async set(key: string, value: Blob): Promise<string> {
    await this._init();
    const attachmentStore = getCasStore(key);
    const drive = new Hyperdrive(attachmentStore);
    const path = `/${key}`
    await writeBlobToHyperdrive(value, drive, path);
    const id = await getHyperdrivePermalink(drive, path);
    setAttachmentDrive(id, drive);
    console.log('saved', id, { value, drive, key});
    return id
  }
  async get(key: string): Promise<Blob | null> {
    console.log('GET', key);
    // ensure initialized
    await this._init();
    const stuff = parseHyperdrivePermalink(key);
    console.log('stuff', stuff);
    if (stuff === null) {
      return null;
    }
    console.log('retrieving')
    const { key: driveKey, path, version, blob } = stuff;
    // const drive = new Hyperdrive(driveKey);
    // need a corestore to pass to the drive
    // how do I get a corestore for the drive key?
    const attachmentStore = getCasStore(path);
    console.log('attachmentStore', attachmentStore);
    // const drive = new Hyperdrive(attachmentStore, driveKey);
    const drive = getAttachmentDrive(key);
    console.log('drive', drive);
    const ready = await drive.ready();
    console.log('drive ready', { ready, drive});
    const blobs = await drive.getBlobs();
    console.log('blobs', blobs);
    return await readBlobFromHyperdrive(drive, path);    
  }
  async delete(key: string): Promise<void> {
    await this._init();
    const stuff = parseHyperdrivePermalink(key);
    if (stuff === null) {
      return;
    }
    const { key: driveKey, path, version, blob } = stuff;
    const drive = new Hyperdrive(driveKey);
    await drive.del(path);    
  }
  async list() {
    await this._init();    
    return [];    
  }
}
