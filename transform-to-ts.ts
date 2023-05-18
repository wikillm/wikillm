// create a script in mjs format
// that scans a directory using ts-morph looking for js files
// and converts them to ts/tsx files
// and writes them to a new directory

import { Project, SourceFile, ts } from 'ts-morph'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { execSync } from 'child_process'

const project = new Project({
  tsConfigFilePath: join(process.cwd(), './tsconfig.json')
})

// a function that takes ts-morph file object
// and on every function declaration
// it renames the function to a new name
// prepending an underscore
// and add new function declaration
// with the original name
// that stores the arguments in a variable called `params`
// wrapping the arguments in `typehole.t` function
// that calls the renamed function
// wrapped in `typehole.t` function
// and returns the file

function upperFirstLetter (string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const addTypehole = (file: SourceFile) => {
  const functions = file.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)
  functions.forEach(func => {
    const name = func.getName()
    if(!name) return
    const newName = `_${name}`
    func.rename(newName)
    const newFunc = `
    interface ${upperFirstLetter(name)}Props {

    }

    interface ${upperFirstLetter(name)}Response {

    }
    export function ${name} (...args: ): ${upperFirstLetter(name)}Props{
      const typedArgs:${upperFirstLetter(name)}Props = typehole.t(args)
      const result:${upperFirstLetter(name)}Response =  typehole.t(${newName}(...args))
      return result
    }`
    file.insertText(func.getEnd(), `\n\n${newFunc}`)
  })
  return file
}

// a function that takes a ts-morph project and a path
// and checks if file has jsx syntax
// and if it does, it returns true
// and if it doesn't, it returns false
const hasJsx = (file: SourceFile) => {
  const jsx = file.getDescendantsOfKind(ts.SyntaxKind.JsxElement)
  return jsx.length > 0
}

const sourceDir = process.cwd()
const targetDir = join(process.cwd(), './ts')

const files = project.addSourceFilesAtPaths('./lib/*.js')
const filesToWrite: any[] = []

files.forEach(file => {
  console.log(file.getFilePath())
  const target = addTypehole(file)

  const targetPath = join(targetDir, file.getFilePath().replace(sourceDir, '').replace('.js', hasJsx(file) ? '.tsx' : '.ts'))
  const targetDirname = targetPath.split('/').slice(0, -1).join('/')
  if (!existsSync(targetDirname)) {
    mkdirSync(targetDirname, { recursive: true })
  }
  filesToWrite.push({ targetPath, target: target.getFullText() })
}

)

filesToWrite.forEach(({ targetPath, target }) => {
  writeFileSync(targetPath, target)
}
)

execSync(`npx prettier --write ${targetDir}/**/*.ts`)

console.log('done')
