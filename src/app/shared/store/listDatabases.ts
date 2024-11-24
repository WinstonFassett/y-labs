const EXCLUDES = ["docs-metadata"];
export async function listDatabases() {
  if (!indexedDB?.databases) {
    console.warn("unable to list databases");
    return Promise.resolve([] as string[]);
  }
  return (await indexedDB.databases())
    .map(({ name }) => name!)
    .filter((name) => !EXCLUDES.includes(name))
    ;
}
