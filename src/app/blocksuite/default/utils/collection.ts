import { AffineSchemas } from '@blocksuite/blocks';
import {
  DocCollection,
  IdGeneratorType,
  Job,
  Schema,
  type DocCollectionOptions
} from '@blocksuite/store';
import { HyperdriveBlobSource } from './CollabBlobSource';
import { StoreDocSource } from './StoreDocSource';

const hyperdriveBlobSource = new HyperdriveBlobSource('collabPlayground')

export function createDefaultDocCollection() {
  const idGenerator: IdGeneratorType = IdGeneratorType.NanoID;
  const schema = new Schema();
  schema.register(AffineSchemas);

  let docSources: DocCollectionOptions['docSources'] = {
    main: new StoreDocSource()
    // shadows: [new BroadcastChannelDocSource()],
  };
  let awarenessSources: DocCollectionOptions['awarenessSources'];
  // new BroadcastChannelAwarenessSource('collabPlayground'),
  
  // const flags: Partial<BlockSuiteFlags> = Object.fromEntries(
  //   [...params.entries()]
  //     .filter(([key]) => key.startsWith('enable_'))
  //     .map(([k, v]) => [k, v === 'true'])
  // );

  const flags = {}
  const options: DocCollectionOptions = {
    id: 'collabPlayground',
    schema,
    idGenerator,
    blobSources: {
      main: hyperdriveBlobSource,
      shadows: []
    },
    docSources,
    awarenessSources,
    defaultFlags: {
      enable_synced_doc_block: true,
      enable_pie_menu: true,
      enable_lasso_tool: true,
      enable_color_picker: true,
      ...flags,
    },
  };
  const collection = new DocCollection(options);
  // collection.start();
  
  // debug info  
  Object.assign(window, {
    collection,
    blockSchemas: AffineSchemas,
    job: new Job({ collection }),
    Y: DocCollection.Y,
  });

  return collection;
}

export async function initDefaultDocCollection(collection: DocCollection) {
  // await collection.waitForSynced();
  const shouldInit = collection.docs.size === 0 
    // && !params.get('room')
    ;
  if (shouldInit) {
    collection.meta.initialize();
  }
}


