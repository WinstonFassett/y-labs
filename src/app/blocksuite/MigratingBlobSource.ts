import type { BlobSource } from "@blocksuite/sync";

/**
 * MigratingBlobSource - A BlobSource that transparently migrates blobs from a previous source to a current source
 * 
 * This BlobSource delegates operations to a "current" storage implementation, but falls back to a 
 * "previous" implementation when needed. When data is found in the previous source, it automatically 
 * migrates it to the current source and removes it from the previous source.
 */
export class MigratingBlobSource implements BlobSource {
  readonly = false;

  constructor(
    readonly name: string,
    private currentSource: BlobSource,
    private previousSource: BlobSource
  ) {}

  async get(key: string): Promise<Blob | null> {
    // First try from current source
    let blob = await this.currentSource.get(key);
    
    // If not found, try from previous source
    if (blob === null) {
      blob = await this.previousSource.get(key);
      
      // If found in previous, migrate it
      if (blob !== null) {
        Promise.resolve().then(async () => {
          console.log(`Migrating blob ${key} from previous to current source`);
          await this.currentSource.set(key, blob!);
          await this.previousSource.delete(key);
        })
      }
    }
    
    return blob;
  }

  async set(key: string, value: Blob): Promise<string> {
    // Always set to current source
    await this.currentSource.set(key, value);
    
    // Clean up from previous source if it exists there
    try {
      if (await this.previousSource.get(key) !== null) {
        await this.previousSource.delete(key);
      }
    } catch (e) {
      // Ignore errors from previous source
      console.warn(`Error cleaning up previous source for key ${key}:`, e);
    }
    
    return key;
  }

  async delete(key: string): Promise<void> {
    // Delete from both sources
    await Promise.all([
      this.currentSource.delete(key),
      this.previousSource.delete(key)
    ]);
  }

  async list(): Promise<string[]> {
    // Get lists from both sources
    const [currentKeys, previousKeys] = await Promise.all([
      this.currentSource.list(),
      this.previousSource.list()
    ]);
    
    // Combine unique keys
    const allKeys = new Set([...currentKeys, ...previousKeys]);
    return Array.from(allKeys);
  }

  /**
   * Migrate all blobs from the previous source to the current source
   * @returns The number of blobs migrated
   */
  async migrateAll(): Promise<number> {
    const previousKeys = await this.previousSource.list();
    let migratedCount = 0;
    
    for (const key of previousKeys) {
      // Skip if already in current source
      if ((await this.currentSource.get(key)) !== null) {
        continue;
      }
      
      const blob = await this.previousSource.get(key);
      if (blob !== null) {
        await this.currentSource.set(key, blob);
        await this.previousSource.delete(key);
        migratedCount++;
      }
    }
    
    console.log(`Migrated ${migratedCount} blobs from previous to current source`);
    return migratedCount;
  }
}
