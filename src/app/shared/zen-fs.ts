import { configure, fs, configureSingle } from '@zenfs/core';
import { WebStorage } from '@zenfs/dom';

await configureSingle({ backend: WebStorage, storage: localStorage });

if (!fs.existsSync('/test.txt')) {
	fs.writeFileSync('/test.txt', 'This will persist across reloads!');
}

const contents = fs.readFileSync('/test.txt', 'utf-8');
console.log(contents);

export { fs }