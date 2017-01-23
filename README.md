# JSON-file-pointer

Simply returns line/column location in a js-file with JSON from path:

```js
const jsonPointer = require('json-file-pointer');

const jsonExample = require('fs').readFileSync('simple.deps.js');

/**
 * ({
 *     shouldDeps: [
 *         { block: 'js' },
 *         { block: 'page', elem: ['header', 'body'] }
 *     ]
 * });
 */

console.log(
    jsonPointer.getLocationOf(jsonExample, ['shouldDeps', 1, 'elem', 0])
    // or: getLocationOf(jsonExample, 'shouldDeps[1].elem[0]')
);

// { line: 4, column: 33 }
```

Also works with `module.exports = { ... }` form.
