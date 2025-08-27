import type { BlobSource } from "@blocksuite/sync";

const isSupported = !!((window as any).showDirectoryPicker && 
  navigator.storage?.getDirectory);

export class OpfsBlobSource implements BlobSource {
  static isSupported = isSupported;

  private readonly metaSuffix = '.mime';

  constructor(readonly name: string) {}
  readonly!: boolean;

  private async getDir(): Promise<any> {
    const nav = navigator as any;
    if (!nav.storage || typeof nav.storage.getDirectory !== 'function') {
      throw new Error('OPFS (navigator.storage.getDirectory) is not available in this environment');
    }
    const root = await nav.storage.getDirectory();
    return await root.getDirectoryHandle(this.name, { create: true });
  }

  async set(key: string, value: Blob) {
    const dir = await this.getDir();

    // Write the blob content to a file with the given key
    const fh = await dir.getFileHandle(key, { create: true });
    const writable = await fh.createWritable();
    // write supports Blob directly
    await writable.write(value);
    await writable.close();

    // Persist mime type in a small sidecar file
    const metaHandle = await dir.getFileHandle(key + this.metaSuffix, { create: true });
    const mw = await metaHandle.createWritable();
    await mw.write(value.type || '');
    await mw.close();

    return key;
  }

  async get(key: string) {
    const dir = await this.getDir();

    try {
      const fh = await dir.getFileHandle(key);
      const file = await fh.getFile();

      // Try to read stored mime type from sidecar file
      let mime = '';
      try {
        const mh = await dir.getFileHandle(key + this.metaSuffix);
        const mf = await mh.getFile();
        mime = await mf.text();
      } catch (e) {
        // sidecar missing or unreadable -> fall back to file.type
      }

      // Return a Blob constructed from the file bytes with the correct mime
      const arrayBuffer = await file.arrayBuffer();
      return new Blob([arrayBuffer], { type: mime || (file as any).type || '' });
    } catch (e) {
      // file doesn't exist
      return null;
    }
  }

  async delete(key: string) {
    const dir = await this.getDir();
    try {
      // removeEntry may not exist on all typings; use any
      await (dir as any).removeEntry?.(key).catch(() => {});
    } catch (e) {
      // ignore
    }
    try {
      await (dir as any).removeEntry?.(key + this.metaSuffix).catch(() => {});
    } catch (e) {
      // ignore
    }
  }

  async list() {
    const dir = await this.getDir();
    const out: string[] = [];

    // dir.entries() returns an async iterator of [name, handle]
    const entries = (dir as any).entries?.();
    if (entries && typeof entries[Symbol.asyncIterator] === 'function') {
      for await (const entry of entries) {
        const name = entry[0];
        const handle = entry[1];
        if (name.endsWith(this.metaSuffix)) continue;
        if (handle && handle.kind === 'file') out.push(name);
      }
      return out;
    }

    // Fallback: some implementations provide keys() async iterator
    const keysIter = (dir as any).keys?.();
    if (keysIter && typeof keysIter[Symbol.asyncIterator] === 'function') {
      for await (const name of keysIter) {
        if (name.endsWith(this.metaSuffix)) continue;
        out.push(name);
      }
      return out;
    }

    return out;
  }
}