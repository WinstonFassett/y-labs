
export interface FileRequest {
  blobId: string;
  completed: boolean;
  size: number | null;
  sources: Map<string, { size: number }>;
  promise: Promise<Blob>;
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
}

export class TransferQueue {
  private queue: FileRequest[] = [];
  private active = new Map<string, FileRequest>();
  private maxConcurrent: number;
  private debounceTimeout: number | null = null;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  add(request: FileRequest): void {
    // Debounce queue processing
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    if (!this.queue.includes(request) && !this.isActive(request.blobId)) {
      this.queue.push(request);
      this.debounceTimeout = window.setTimeout(() => {
        this.sortQueue();
        this.debounceTimeout = null;
      }, 100);
    }
  }

  private sortQueue(): void {
    // Sort by size (smallest first) if size is known, otherwise put at end
    this.queue.sort((a, b) => {
      if (a.size === null) return 1;
      if (b.size === null) return -1;
      return a.size - b.size;
    });
  }

  remove(blobId: string): void {
    this.queue = this.queue.filter(r => r.blobId !== blobId);
    this.active.delete(blobId);
  }

  isActive(blobId: string): boolean {
    return this.active.has(blobId);
  }

  getNext(): FileRequest | undefined {
    if (this.active.size >= this.maxConcurrent) return undefined;
    return this.queue.shift();
  }

  setActive(request: FileRequest): void {
    this.active.set(request.blobId, request);
  }

  clearActive(blobId: string): void {
    this.active.delete(blobId);
  }
}