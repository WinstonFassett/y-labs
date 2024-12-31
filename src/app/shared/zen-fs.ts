import { configure, fs, configureSingle } from '@zenfs/core';
import {} from '@zenfs/dom'
import { IndexedDB } from '@zenfs/dom';

await configureSingle({ backend: IndexedDB });

if (!fs.existsSync('/test.txt')) {
	fs.writeFileSync('/test.txt', 'This will persist across reloads!');
}

const contents = fs.readFileSync('/test.txt', 'utf-8');
console.log(contents);
window.zenfs = fs
export { fs }