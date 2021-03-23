import MagicString, { SourceMap } from 'magic-string'
import * as ts from 'typescript'

export function rewritePaths(input: string, rewrite: (path: string) => string) {
  const output = new MagicString(input)
  extractPaths(input).forEach(path => {
    const result = rewrite(path.id)
    if (result !== path.id && typeof result == 'string') {
      output.overwrite(path.start, path.end, result)
    }
  })
  return output.toString()
}

export interface ModulePath {
  id: string
  start: number
  end: number
}

export function extractPaths(input: string) {
  const paths: ModulePath[] = []
  const addPath = (origin: ts.Expression) => {
    // Omit the quote characters.
    const start = origin.getStart(module) + 1
    const end = origin.getEnd() - 1
    paths.push({
      id: input.slice(start, end),
      start,
      end,
    })
  }
  const module = ts.createSourceFile('', input, ts.ScriptTarget.Latest)
  module.forEachChild(node => {
    if (ts.isImportDeclaration(node)) {
      addPath(node.moduleSpecifier)
    } else if (ts.isExportDeclaration(node)) {
      const origin = node.moduleSpecifier
      if (origin) addPath(origin)
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const init = decl.initializer
        if (init && ts.isCallExpression(init)) {
          const callee = init.expression
          if (ts.isIdentifier(callee) && callee.text == 'require') {
            const origin = init.arguments[0]
            if (origin && ts.isStringLiteral(origin)) {
              addPath(origin)
            }
          }
        }
      }
    }
  })
  return paths
}
