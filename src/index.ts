import MagicString, { SourceMap } from 'magic-string'
import * as ts from 'typescript'

export function rewritePaths(input: string, rewrite: (path: string) => string) {
  const output = new MagicString(input)
  extractPaths(input).forEach(i => {
    const text = rewrite(i.text)
    if (text !== i.text && typeof text == 'string') {
      output.overwrite(i.start, i.end, text)
    }
  })
  return output.toString()
}

export interface ImportPath {
  text: string
  start: number
  end: number
}

export function extractPaths(input: string) {
  const imports: ImportPath[] = []
  const module = ts.createSourceFile('', input, ts.ScriptTarget.Latest)
  module.forEachChild(node => {
    if (ts.isImportDeclaration(node)) {
      const origin = node.moduleSpecifier

      // Omit the quote characters.
      const start = origin.getStart(module) + 1
      const end = origin.getEnd() - 1

      imports.push({
        text: input.slice(start, end),
        start,
        end,
      })
    }
  })
  return imports
}
