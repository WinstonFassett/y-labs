import { AffineSchemas } from '@blocksuite/blocks';
import { DocCollection, Schema } from '@blocksuite/store';

export const schema = new Schema().register(AffineSchemas);
export const collection = new DocCollection({ schema });
console.log('collection', collection)
collection.meta.initialize();


// Object.assign(window, {
//   collection
// })
