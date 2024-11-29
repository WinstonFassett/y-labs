export function buildUrl(pathParts: (string | undefined)[], searchParts: Record<string, string | undefined>) {
  const path = pathParts
    .filter(Boolean)
    .join("/");
  const search = Object.entries(searchParts)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const url = [path, search].filter(Boolean).join("?");
  return url;
}
