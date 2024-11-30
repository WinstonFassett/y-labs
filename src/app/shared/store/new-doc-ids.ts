import { atom } from "nanostores";

export const $newDocIds = atom(new Set<string>())
