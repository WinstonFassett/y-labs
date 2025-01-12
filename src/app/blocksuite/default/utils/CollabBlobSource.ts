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
    // console.log('saved', id, { value, drive, key});
    return id
  }
  async get(key: string): Promise<Blob | null> {
    // ensure initialized
    await this._init();
    
    const linkData = parseHyperdrivePermalink(key);
    if (linkData === null) {
      return null;
    }
    const { key: driveKey, path, version, blob } = linkData;
    const drive = getAttachmentDrive(key);
    await drive.ready();    
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
