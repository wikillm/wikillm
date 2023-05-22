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

const upperFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}



const addTypehole = (file: SourceFile) => {
  const modifiedFunctions: string[] = []

  function addMethods (){
    const classDeclarations = file.getDescendantsOfKind(ts.SyntaxKind.ClassDeclaration);

    // Iterate over each class declaration
    classDeclarations.forEach((classDeclaration) => {
      // Get all methods of the class
      const methods = classDeclaration.getMethods();
      let stopped = false

      // Iterate over each method
      methods.forEach((method) => {
        if (stopped) return

        const name = method.getName() as string;
        if (modifiedFunctions.includes(name)) return
        if (name?.startsWith('_')) return
        console.log('name', name)
        if (!name) return
        const newName = `_${name}`
        modifiedFunctions.push(name, newName)
        method.getNameNode().replaceWithText(newName)
        // func.rename(newName)
        // add a new method with the original name
        // that calls the renamed method
        // and returns the result
        const types = `
export type ${upperFirstLetter(name)}Props = any
export type ${upperFirstLetter(name)}Response = any
      `
        // add the types befor the class 
        file.insertText(classDeclaration.getStart(), types)
        const newMethod = `
    public ${name} (...args: ${upperFirstLetter(name)}Props): any {
      const typedArgs:${upperFirstLetter(name)}Props = typehole.t(args)
      const result:${upperFirstLetter(name)}Response =  typehole.t(this.${newName}(...args))
      return result
    }
` 
        file.insertText(method.getEnd(), `\n\n${newMethod}`)
        stopped = true
        addMethods()

        // add the new method after the method

      })
    })
  }
  addMethods()



  function addArrowFunctions() {
    try {

      const variableDeclarations = file.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration)
        .filter((declaration) => declaration.getInitializer()?.getKind() === ts.SyntaxKind.ArrowFunction);
      let stopped = false
      variableDeclarations.forEach(func => {
        if (stopped) return
        const name = func.getName() as string;
        if (modifiedFunctions.includes(name)) return
        if (name?.startsWith('_')) return
        console.log('name', name)
        if (!name) return
        const newName = `_${name}`
        modifiedFunctions.push(name, newName)
        func.getNameNode().replaceWithText(newName)
        // func.rename(newName)
        const newFunc = `
export type ${upperFirstLetter(name)}Props = any
export type ${upperFirstLetter(name)}Response = any
export function ${name} (...args: ${upperFirstLetter(name)}Props ): any{
  const typedArgs:${upperFirstLetter(name)}Props = typehole.t(args)
  const result:${upperFirstLetter(name)}Response =  typehole.t(${newName}(...args))
  return result
}

`
        file.insertText(func.getEnd(), `\n\n${newFunc}`)
        stopped = true
        addArrowFunctions()
      })
      // file.saveSync()
      console.log('saved', file.getFilePath())

    } catch (e) {
      console.log(e)
      console.log('failed', file.getFilePath())
    }
  }
  addArrowFunctions()
  function add() {
    try {

      const functions = file.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)
      let stopped = false
      functions.forEach(func => {
        if (stopped) return
        const name = func.getName() as string;
        if(modifiedFunctions.includes(name)) return
        if (name?.startsWith('_')) return
        console.log('name', name)
        if (!name) return
        const newName = `_${name}`
        modifiedFunctions.push( name, newName )
        // func.getNameNode().replaceWithText(newName)
        const newFunc = `
export type ${upperFirstLetter(name)}Props = any
export type ${upperFirstLetter(name)}Response = any
export function ${name} (...args: ${upperFirstLetter(name)}Props ): any {
  const typedArgs:${upperFirstLetter(name)}Props = typehole.t(args)
  const result:${upperFirstLetter(name)}Response =  typehole.t(${newName}(...args))
  return result
}

`
        file.insertText(func.getEnd(), `\n\n${newFunc}`)
        stopped = true
        add()
      })
      // file.saveSync()
      console.log('saved', file.getFilePath())

    } catch (e) {
      console.log(e)
      console.log('failed', file.getFilePath())
    }
  }
  add()
  // use ts-morph to add typehole import at the top of the file


  // use ts-morph to add typehole import at the top of the file
  const importDeclaration = file.getImportDeclaration('typehole')
  if (!importDeclaration) {
    file.insertText(0, `import typehole from 'typehole'\n`)
  }




  return file.getFullText()
}

// a function that takes a ts-morph project and a path
// and checks if file has jsx syntax
// and if it does, it returns true
// and if it doesn't, it returns false
const hasJsx = (file: SourceFile) => {
  const jsx: any = file.getDescendantsOfKind(ts.SyntaxKind.JsxElement)
  jsx.push(...file.getDescendantsOfKind(ts.SyntaxKind.JsxSelfClosingElement))
  return jsx.length > 0
}

const sourceDir = process.cwd()
const targetDir = join(process.cwd(), './ts')

const files = project.getSourceFiles('**/*.js')
console.log(files)
const filesToWrite: any[] = []

files.forEach(async file => {
  console.log(file.getFilePath())
  const sourceFile = project.getSourceFile(file.getFilePath()) as SourceFile
  const target = await addTypehole(sourceFile)

  const targetPath = join(targetDir, file.getFilePath().replace(sourceDir, '').replace('.js', hasJsx(file) ? '.tsx' : '.ts'))

  console.log(targetPath)
  const targetDirname = targetPath.split('/').slice(0, -1).join('/')
  if (!existsSync(targetDirname)) {
    mkdirSync(targetDirname, { recursive: true })
  }
  writeFileSync(targetPath, target)
  execSync(`npx prettier --write ${targetPath}`)
  // filesToWrite.push({ targetPath, target })
})

// filesToWrite.forEach(({ targetPath, target }) => {
// })


console.log('done')
