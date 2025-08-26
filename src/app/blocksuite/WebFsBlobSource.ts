import type { BlobSource } from "@blocksuite/sync";

// Type definitions to match memfs's FsaNodeFs
interface FileSystemDirectoryHandle {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  removeEntry?(name: string): Promise<void>;
  entries?(): AsyncIterable<[string, FileSystemHandle]>;
  keys?(): AsyncIterable<string>;
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  createWritable(options?: any): Promise<FileSystemWritableFileStream>;
}

interface FileSystemHandle {
  kind: string;
  name?: string;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

// Simplified FsaNodeFs - inspired by streamich's implementation but simplified
class FsaNodeFs {
  promises: any;
  syncAdapter: any = null;

  constructor(private root: FileSystemDirectoryHandle) {
    this.promises = {
      mkdir: this.mkdir.bind(this),
      writeFile: this.writeFile.bind(this),
      readFile: this.readFile.bind(this),
      unlink: this.unlink.bind(this),
      readdir: this.readdir.bind(this)
    };
  }

  // Node-like fs.promises.mkdir
  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const parts = path.replace(/^\//, '').split('/');
    let current = this.root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      
      try {
        current = await current.getDirectoryHandle(part, { create: true });
      } catch (e) {
        if (!options?.recursive) throw e;
        // If recursive, try to create all directories in path
      }
    }
  }

  // Node-like fs.promises.writeFile
  async writeFile(path: string, data: any): Promise<void> {
    const { dir, name } = this.parsePath(path);
    const parentDir = await this.getDirectory(dir, true);
    const fileHandle = await parentDir.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }

  // Node-like fs.promises.readFile
  async readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string> {
    const { dir, name } = this.parsePath(path);
    const parentDir = await this.getDirectory(dir, false);
    const fileHandle = await parentDir.getFileHandle(name);
    const file = await fileHandle.getFile();
    
    if (options?.encoding === 'utf8') {
      return await file.text();
    }
    
    return new Uint8Array(await file.arrayBuffer());
  }

  // Node-like fs.promises.unlink
  async unlink(path: string): Promise<void> {
    const { dir, name } = this.parsePath(path);
    const parentDir = await this.getDirectory(dir, false);
    
    if (parentDir.removeEntry) {
      await parentDir.removeEntry(name);
    } else {
      throw new Error('removeEntry not supported');
    }
  }

  // Node-like fs.promises.readdir
  async readdir(path: string): Promise<string[]> {
    const dir = await this.getDirectory(path, false);
    const entries = [];
    
    // Use entries() or keys() depending on what's available
    if (dir.entries) {
      for await (const [name, handle] of dir.entries()) {
        entries.push(name);
      }
    } else if (dir.keys) {
      for await (const name of dir.keys()) {
        entries.push(name);
      }
    }
    
    return entries;
  }

  private parsePath(path: string): { dir: string, name: string } {
    const normalizedPath = path.replace(/^\//, '');
    const lastSlash = normalizedPath.lastIndexOf('/');
    
    if (lastSlash === -1) {
      return { dir: '', name: normalizedPath };
    }
    
    const dir = normalizedPath.substring(0, lastSlash);
    const name = normalizedPath.substring(lastSlash + 1);
    
    return { dir, name };
  }

  private async getDirectory(path: string, create = false): Promise<FileSystemDirectoryHandle> {
    if (!path || path === '/') return this.root;
    
    const parts = path.replace(/^\//, '').split('/');
    let current = this.root;
    
    for (const part of parts) {
      if (!part) continue;
      current = await current.getDirectoryHandle(part, { create });
    }
    
    return current;
  }
}

export class WebFsBlobSource implements BlobSource {
  private readonly metaSuffix = '.mime';
  private fs: FsaNodeFs;

  constructor(readonly name: string, fs?: FsaNodeFs) {
    this.fs = fs;
  }

  readonly = false;

  /**
   * Initialize the WebFsBlobSource with a simplified FsaNodeFs instance
   * 
   * @param name - The name of the blob source (used for directory name)
   * @returns A new WebFsBlobSource instance
   */
  static async create(name: string): Promise<WebFsBlobSource> {
    // Use the OPFS root as the backing store
    const dirHandle = await navigator.storage.getDirectory() as unknown as FileSystemDirectoryHandle;
    const fs = new FsaNodeFs(dirHandle);
    
    const instance = new WebFsBlobSource(name, fs);
    await instance.init();
    return instance;
  }

  private async init() {
    if (!this.fs) {
      throw new Error('WebFsBlobSource requires a FsaNodeFs instance');
    }
    
    // Ensure base directory exists
    await this.ensureDir();
  }

  private get dirPath() {
    return `/${this.name}`;
  }
  
  private filePath(key: string) {
    return `${this.dirPath}/${key}`;
  }
  
  private async ensureDir() {
    try {
      await this.fs.promises.mkdir(this.dirPath, { recursive: true });
    } catch (e) {
      // Directory may already exist, or recursive not supported
      // Either way, we'll find out on first file operation
    }
  }

  async set(key: string, value: Blob) {
    await this.ensureDir();
    const path = this.filePath(key);
    const metaPath = `${path}${this.metaSuffix}`;
    
    // Convert blob to ArrayBuffer for writing
    const buf = new Uint8Array(await value.arrayBuffer());
    
    // Write the blob content
    await this.fs.promises.writeFile(path, buf);
    
    // Write mime type to sidecar file
    await this.fs.promises.writeFile(metaPath, value.type || '');
    
    return key;
  }

  async get(key: string) {
    const path = this.filePath(key);
    let mime = '';
    
    try {
      // Read the actual content
      const data = await this.fs.promises.readFile(path);
      
      // Try to read the mime type from sidecar file
      try {
        const metaPath = `${path}${this.metaSuffix}`;
        const metaContent = await this.fs.promises.readFile(metaPath, { encoding: 'utf8' });
        mime = typeof metaContent === 'string' ? metaContent : new TextDecoder().decode(metaContent as Uint8Array);
      } catch (e) {
        // Sidecar missing or unreadable, continue with empty mime
      }
      
      // Convert to Blob with correct mime type
      const arr = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
      return new Blob([arr], { type: mime || '' });
    } catch (e) {
      // File doesn't exist or error reading
      return null;
    }
  }

  async delete(key: string) {
    const path = this.filePath(key);
    const metaPath = `${path}${this.metaSuffix}`;
    
    try {
      await this.fs.promises.unlink(path);
    } catch (e) {
      // Ignore if file doesn't exist
    }
    
    try {
      await this.fs.promises.unlink(metaPath);
    } catch (e) {
      // Ignore if meta file doesn't exist
    }
  }

  async list() {
    try {
      await this.ensureDir();
      const files = await this.fs.promises.readdir(this.dirPath);
      return files.filter(name => !name.endsWith(this.metaSuffix));
    } catch (e) {
      // Error reading directory
      return [];
    }
  }
}
