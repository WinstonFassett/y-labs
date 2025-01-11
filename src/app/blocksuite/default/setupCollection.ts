import {
  createDefaultDocCollection,
  initDefaultDocCollection,
} from './utils/collection.js';


async function main() {  
  const collection = await createDefaultDocCollection();
  await initDefaultDocCollection(collection);
  
  return { collection }
}

export const CollectionSetup = main()