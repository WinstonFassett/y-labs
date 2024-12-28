import * as Y from "yjs";

export function getDocMeta(doc: Y.Doc, name: string) {
  const meta = doc.getMap("meta").toJSON() as { [key: string]: any; title?: string; };
  const shares = Array.from(doc.share.keys()) as string[];
  let type = shares.find((s) => !Ignores.includes(s)) || "unknown";
  if (type === 'blocks') { type = 'blocksuite'; }
  return Object.assign(meta, { name, type });
}
const Ignores = ["meta", "versions", "tldraw_meta"];
