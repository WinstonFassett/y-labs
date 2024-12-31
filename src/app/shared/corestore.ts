import { createLevelRandomAccessFileSystem } from "@/lib/level-random-access";
import Corestore from "corestore";

const { createFile } = createLevelRandomAccessFileSystem();

export const corestore = new Corestore(createFile);
window.corestore = corestore