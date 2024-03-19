Needed to edit

eventemitter import

```js
import eventemitter3 from "eventemitter3";
const { EventEmitter } = eventemitter3;
```

lzstring import

```js
import lzString from "lz-string";
const { compressToBase64, decompressFromBase64 } = lzString;
```

Also see

https://tldraw.dev/installation

You can use our getAssetUrls helper function from the @tldraw/assets package to generate these urls for you.

```js
import { getAssetUrls } from '@tldraw/assets/selfHosted'
const assetUrls = getAssetUrls()
<Tldraw assetUrls={assetUrls} />
```
