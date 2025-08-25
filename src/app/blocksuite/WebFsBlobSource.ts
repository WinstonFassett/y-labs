import type { BlobSource } from "@blocksuite/sync";

// WebFsBlobSource - Node-like `fs` API adapter
// Usage:
// 1) Preferred: inject a Node-like fs (with `promises`) when constructing:
//      const src = new WebFsBlobSource('mydir', fs);
// 2) Or load streamich/webfs.js (or similar) that exposes a Node-like API and pass it:
//      // bootstrap code (example, run in browser init code):
//      // import '/path/to/webfs.js' // this should set window.fs or export fs
//      const src = new WebFsBlobSource('mydir', (window as any).fs);
// The class intentionally does not depend on any particular memfs package so it stays agnostic.

export class WebFsBlobSource implements BlobSource {
  private readonly metaSuffix = '.mime';

  constructor(readonly name: string, private fs?: any) {}
  readonly!: boolean;

  private getFs(): any {
    if (this.fs) return this.fs;
    const g = (globalThis as any);
    if (g && g.fs) return g.fs;
    throw new Error('No fs provided. Pass a Node-like fs to WebFsBlobSource or load a webfs shim that exposes one.');
  }

  private getPromises(fs: any) {
    if (fs.promises) return fs.promises;
    return {
      mkdir: (path: string, opts?: any) => new Promise((res, rej) => fs.mkdir(path, opts, (e: any) => (e ? rej(e) : res(undefined)))),
      writeFile: (path: string, data: any, opts?: any) => new Promise((res, rej) => fs.writeFile(path, data, opts, (e: any) => (e ? rej(e) : res(undefined)))),
      readFile: (path: string, opts?: any) => new Promise((res, rej) => fs.readFile(path, opts, (e: any, d: any) => (e ? rej(e) : res(d)))),
      unlink: (path: string) => new Promise((res, rej) => fs.unlink(path, (e: any) => (e ? rej(e) : res(undefined)))),
      readdir: (path: string) => new Promise((res, rej) => fs.readdir(path, (e: any, d: any) => (e ? rej(e) : res(d)))),
      stat: (path: string) => new Promise((res, rej) => fs.stat(path, (e: any, d: any) => (e ? rej(e) : res(d)))),
    };
  }

  private filePath(key: string) {
    const dir = `/${this.name}`;
    return `${dir}/${key}`;
  }

  async set(key: string, value: Blob) {
    const fs = this.getFs();
    const p = this.getPromises(fs);
    const dir = `/${this.name}`;

    try {
      await p.mkdir(dir, { recursive: true });
    } catch (e) {
      // ignore
    }

    const path = this.filePath(key);
    const buf = new Uint8Array(await value.arrayBuffer());
    await p.writeFile(path, buf);
    await p.writeFile(path + this.metaSuffix, value.type || '');
    return key;
  }

  async get(key: string) {
    const fs = this.getFs();
    const p = this.getPromises(fs);
    const path = this.filePath(key);

    try {
      const data = await p.readFile(path);
      let mime = '';
      try {
        const m = await p.readFile(path + this.metaSuffix, 'utf8');
        if (typeof m === 'string') mime = m;
      } catch (_) {}

      const arr = (data instanceof Uint8Array) ? data : new Uint8Array(data);
      return new Blob([arr], { type: mime || '' });
    } catch (e) {
      return null;
    }
  }

  async delete(key: string) {
    const fs = this.getFs();
    const p = this.getPromises(fs);
    const path = this.filePath(key);
    try { await p.unlink(path); } catch (_) {}
    try { await p.unlink(path + this.metaSuffix); } catch (_) {}
  }

  async list() {
    const fs = this.getFs();
    const p = this.getPromises(fs);
    const dir = `/${this.name}`;
    try {
      const names: string[] = await p.readdir(dir);
      return names.filter((n) => !n.endsWith(this.metaSuffix));
    } catch (e) {
      return [];
    }
  }
}
