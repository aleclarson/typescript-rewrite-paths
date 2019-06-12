import { rewritePaths, extractPaths } from '../src'
import dedent = require('dedent')

test('rewritePaths', () => {
  const code = dedent`
    import {a} from 'foo'
    import {a,b,c} from 'foo/lib/bar.js'
    import {a as b} from 'foo'
    import {a as b, c as d} from '@foo/bar'
    import * as foo from 'foo'
    import foo from 'foo'
    import foo, {a,b} from 'foo'
  `

  expect(extractPaths(code)).toMatchSnapshot()

  const result = rewritePaths(code, path => {
    // For fun, treat direct imports differently.
    if (path.endsWith('.js')) {
      return path.replace(/\.js$/, '.mjs')
    }
    // Skip scoped imports.
    if (path.startsWith('@')) {
      return path
    }
    // Prepend our scope to each import.
    return '@scope/' + path
  })

  expect(result).toMatchSnapshot()
})
