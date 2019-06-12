# typescript-rewrite-paths

```ts
import {rewritePaths} from 'typescript-rewrite-paths'

// The input and output are code strings.
const output = rewritePaths(input, path => {
  // Return a string or falsy.
  return path
})
```
