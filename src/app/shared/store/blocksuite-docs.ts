import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { AffineSchemas } from '@blocksuite/blocks';
import { Doc as BsDoc, DocCollection, IdGeneratorType, Schema, type DocCollectionOptions } from '@blocksuite/store';
import {
  // BroadcastChannelAwarenessSource,
  // BroadcastChannelDocSource,
  IndexedDBBlobSource,
  IndexedDBDocSource,
  type BlobSource,
} from '@blocksuite/sync';
import { atom } from "nanostores";

const idGenerator: IdGeneratorType = IdGeneratorType.NanoID;

export const schema = new Schema().register(AffineSchemas);

let awarenessSources: DocCollectionOptions['awarenessSources'];

const blocksuiteDocsT = mapTemplate(
  (id) => atom<BsDoc>(undefined as any),
  (store, id) => {

    const flags = {}
    const options: DocCollectionOptions = {
      id: 'collabPlayground',
      schema,
      idGenerator,
      blobSources: {
        main: new IndexedDBBlobSource('collabPlayground'),
        shadows: [
          // createDocRoomBlobSource(id)
        ]
      },
      docSources: {
        main: new IndexedDBDocSource(),
      },
      awarenessSources: undefined,
      defaultFlags: {
        enable_synced_doc_block: true,
        enable_pie_menu: true,
        enable_lasso_tool: true,
        enable_color_picker: true,
        ...flags,
      },
    };

    const collection = new DocCollection({ schema });
    collection.meta.initialize();
    const bsDoc = collection.createDoc({ id })
    const awareness = bsDoc.awarenessStore.awareness
    Object.assign(bsDoc.spaceDoc, {
      blocksuite: bsDoc,
      awareness,
    })
    store.set(bsDoc);  
    return () => {      
      bsDoc.dispose()
    }
  }
)

export function getBlocksuiteDocStore(id: string) {
  return blocksuiteDocsT(id);
}

export function createDocRoomBlobSource(id: string) {
  async function get(key: string) {
    console.log('todo: get', key)
    return null
  }
  async function set(key: string, value: Blob): Promise<string> {
    throw new Error("Function not implemented.");
    // return key
  }
  function destroy () {}
  const source: BlobSource & { destroy: typeof destroy }  = {
    name: "",
    readonly: true,
    get,
    set,
    delete: function (key: string): Promise<void> {
      throw new Error("Function not implemented.");
    },
    list: function (): Promise<string[]> {
      throw new Error("Function not implemented.");
    },
    destroy
  }
  return source
}