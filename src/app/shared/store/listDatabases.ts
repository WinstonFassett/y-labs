const EXCLUDES = ["docs-metadata", "blocksuite-local", "corestore", "primary-key", "###meta", "cores"];
export async function listDatabases() {
  if (!indexedDB?.databases) {
    console.warn("unable to list databases");
    return Promise.resolve([] as string[]);
  }
  return (await indexedDB.databases())
    .map(({ name }) => name!)
    .filter((name) => 
      !EXCLUDES.includes(name) &&
      !name.endsWith("_blob") &&
      !name.endsWith("_mime") && 
      !name.startsWith("cores/") &&
      !name.startsWith("level-js")
    )
    ;
}
