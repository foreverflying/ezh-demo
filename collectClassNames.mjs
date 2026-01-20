import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

export const getAllClassNames = (dir) => {
    const thisFileName = fileURLToPath(import.meta.url)
    const thisDirName = path.dirname(thisFileName)
    dir = path.isAbsolute(dir) ? dir : path.join(thisDirName, dir)
    const results = []
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.ts')) continue
        if (file.endsWith('.generated.ts')) continue

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
                node.name &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
            ) {
                const className = node.name.text
                const members = []
                for (const member of node.members) {
                    if (ts.isConstructorDeclaration(member)) {
                        continue
                    }
                    if (member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword)) {
                        continue
                    }
                    const nameNode = member.name
                    if (!nameNode) {
                        continue
                    }
                    if (ts.isIdentifier(nameNode)) {
                        members.push(nameNode.text)
                    }
                }
                results.push({ className, members })
            }
        })
    }
    return results
}

export const collectClassNames = (dir, needClassNames, needMemberNames) => {
    const results = getAllClassNames(dir)
    let classNameArr, memberNameArr
    if (needClassNames) {
        classNameArr = results.map((result) => result.className)
        if (!needMemberNames) {
            return classNameArr
        }
    }
    if (needMemberNames) {
        memberNameArr = results.map((result) => result.members).flat()
        if (!needClassNames) {
            return memberNameArr
        }
    }
    return [...needClassNames, ...needMemberNames]
}
