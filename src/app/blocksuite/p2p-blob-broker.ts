import type { BlobSource } from "@blocksuite/sync";
import type { JsonValue, Room } from "trystero";
import { TransferQueue, type FileRequest } from "./transfer-queue";
import { DocEvents } from "../shared/store/doc-events";

type MessageType = 'want' | 'unwant' | 'have' | 'fetch';

interface Message {
  type: MessageType;
  blobId: string;
  size?: number;
  [key:string]: any
}

interface RoomState {
  room: Room;
  peers: Set<string>;
  sendControl: (msg: Message, peerIds?: string[]) => void;
  sendFile: (data: ArrayBuffer, peerIds?: string[], meta?: { blobId: string }) => void;
  listenFile: (handler: (data: ArrayBuffer, peerId: string, meta?: { blobId: string }) => void) => void;
  listenControl: (handler: (msg: Message, peerId: string) => void) => void;
  cleanup: () => void;
}

export class P2PBlobBroker extends EventTarget {
  private source: BlobSource;
  private rooms = new Map<string, RoomState>();
  private wanted = new Map<string, FileRequest>();
  private queue: TransferQueue;
  private docFilter: (docId: string, roomId: string) => boolean;

  constructor(source: BlobSource, docId: string) {
    super();
    this.source = source;
    this.queue = new TransferQueue();
    this.docFilter = (eventDocId, roomId) => eventDocId === docId;

    this.setupDocEvents();
    this.startQueueProcessor();
  }

  private setupDocEvents(): void {
    DocEvents.on('joinedRoom', ev => {
      if (!this.docFilter(ev.docId, ev.roomId)) return;

      const room = (ev.provider.trystero as Room);
      const [sendControl, listenControl] = room.makeAction<Message>('m');
      const [sendFile, listenFile] = room.makeAction<ArrayBuffer>('f');

      const state: RoomState = {
        room,
        peers: new Set(),
        sendControl,
        sendFile,
        listenFile: listenFile as any,
        listenControl,
        cleanup: () => this.rooms.delete(ev.roomId)
      };

      this.setupRoomHandlers(state);
      this.rooms.set(ev.roomId, state);

      // Announce existing wants
      for (const [blobId, request] of this.wanted.entries()) {
        if (!request.completed) {
          state.sendControl({ type: 'want', blobId });
        }
      }
    });

    DocEvents.on('leftRoom', ev => {
      if (!this.docFilter(ev.docId, ev.roomId)) return;
      const state = this.rooms.get(ev.roomId);
      if (state) state.cleanup();
    });
  }

  private setupRoomHandlers(state: RoomState): void {
    state.room.onPeerJoin(peerId => {
      state.peers.add(peerId);
      // Announce wants to new peer
      for (const [blobId, request] of this.wanted.entries()) {
        if (!request.completed) {
          state.sendControl({ type: 'want', blobId }, [peerId]);
        }
      }
    });

    state.room.onPeerLeave(peerId => {
      state.peers.delete(peerId);
      // Clean up this peer's entries in sources
      for (const request of this.wanted.values()) {
        request.sources.delete(peerId);
      }
    });

    state.listenControl((msg: Message, peerId: string) => {
      switch (msg.type) {
        case 'want':
          this.handleWant(msg.blobId, peerId, state);
          break;
        case 'unwant':
          // Just let the peer track this
          break;
        case 'have':
          this.handleHave(msg.blobId, msg.size!, peerId);
          break;
        case 'fetch':
          this.handleFetch(msg.blobId, peerId, state);
          break;
      }
    });

    state.listenFile(async (data: ArrayBuffer, peerId: string, meta?: { blobId: string }) => {
      if (!meta?.blobId) return;
      
      const request = this.wanted.get(meta.blobId);
      if (!request) return;

      try {
        const blob = new Blob([data]);
        await this.source.set(meta.blobId, blob);
        request.completed = true;
        request.resolve(blob);
        this.queue.remove(meta.blobId);
      } catch (err) {
        console.error('Failed to handle file:', err);
        request.reject(new Error('Failed to handle file'));
      }
    });
  }

  private async handleWant(blobId: string, peerId: string, state: RoomState) {
    try {
      const blob = await this.source.get(blobId);
      if (blob) {
        state.sendControl({ 
          type: 'have', 
          blobId,
          size: blob.size 
        }, [peerId]);
      }
    } catch (err) {
      console.warn('Error handling want:', err);
    }
  }

  private handleHave(blobId: string, size: number, peerId: string) {
    const request = this.wanted.get(blobId);
    if (request && !request.completed) {
      request.size = size;
      request.sources.set(peerId, { size });
      if (!this.queue.isActive(blobId)) {
        this.queue.add(request);
      }
    }
  }

  private async handleFetch(blobId: string, peerId: string, state: RoomState) {
    try {
      const blob = await this.source.get(blobId);
      if (!blob) return;

      const buffer = await blob.arrayBuffer();
      state.sendFile(buffer, [peerId], { blobId });
    } catch (err) {
      console.warn('Error handling fetch:', err);
    }
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      const request = this.queue.getNext();
      if (!request || request.completed) return;

      // Pick first available source
      const [peerId] = request.sources.keys();
      if (!peerId) return;

      this.queue.setActive(request);

      // Find room with this peer
      for (const state of this.rooms.values()) {
        if (state.peers.has(peerId)) {
          state.sendControl({ type: 'fetch', blobId: request.blobId }, [peerId]);
          break;
        }
      }
    }, 100);
  }

  // Public API
  async getBlob(blobId: string): Promise<Blob> {
    const existing = this.wanted.get(blobId);
    if (existing) return existing.promise;

    let resolver!: (blob: Blob) => void;
    let rejecter!: (error: Error) => void;
    const promise = new Promise<Blob>((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

    const request: FileRequest = {
      blobId,
      completed: false,
      size: null,
      sources: new Map(),
      promise,
      resolve: resolver,
      reject: rejecter
    };

    this.wanted.set(blobId, request);
    this.queue.add(request);

    // Broadcast want to all rooms
    for (const state of this.rooms.values()) {
      state.sendControl({ type: 'want', blobId });
    }

    return promise;
  }

  destroy(): void {
    // Clean up all rooms
    for (const state of this.rooms.values()) {
      state.cleanup();
    }
    this.rooms.clear();

    // Reject any pending requests
    for (const request of this.wanted.values()) {
      if (!request.completed) {
        request.reject(new Error('Broker destroyed'));
      }
    }
    this.wanted.clear();
  }
}