import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

export const getAllClassName = (dir) => {
    const thisFileName = fileURLToPath(import.meta.url)
    const thisDirName = path.dirname(thisFileName)
    dir = path.isAbsolute(dir) ? dir : path.join(thisDirName, dir)
    const classes = []
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.ts')) {
            continue
        }
        const filePath = path.join(dir, file)
        const source = ts.createSourceFile(
            filePath,
            fs.readFileSync(filePath, 'utf8'),
            ts.ScriptTarget.Latest,
            true,
        )

        source.forEachChild(node => {
            if (
                ts.isClassDeclaration(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
            ) {
                const name = node.name?.text
                if (name) {
                    classes.push(name)
                }
            }
        })
    }
    return classes
}
