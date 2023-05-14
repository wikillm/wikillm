import { Project } from 'ts-morph'
import ts from 'typescript'
import { glob } from 'glob'
import fs from 'fs'
// Create a new project instance
function getModules (dir) {
  const project = new Project()

  // Load the project from the current directory
  project.addSourceFilesAtPaths(dir + '/*.js')

  // Get all source files in the project
  const sourceFiles = project.getSourceFiles()
  const modules = new Set()
  // Iterate over each source file
  for (const sourceFile of sourceFiles) {
    // Get all import declarations in the source file
    const importDeclarations = sourceFile.getDescendantsOfKind(
      ts.SyntaxKind.ImportDeclaration
    )

    // Iterate over each import declaration
    for (const importDeclaration of importDeclarations) {
      // Get the string literal part of the import declaration
      const importPath = importDeclaration.getModuleSpecifierValue()
      modules.add(importPath)
      // Do something with the import path
      console.log(importPath)
    }
  }
  return Array.from(modules)
}
const dirs = glob.sync('*/', {
  // ignore node_modules
  ignore: ['**/node_modules/**']
})
// getModules()
console.log(dirs)
dirs.forEach(dir => {
  console.log('DIR', dir)
  const modules = getModules(dir)
  // read the top level package.json
  // store the name and version
  // store the dependencies
  // for each dir create a package.json
  // add the name and version
  // add the dependencies using the modules array as the keys
  // and the version from the top level package.json dependencies
  // write the package.json to the dir
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const { name, version, dependencies } = packageJson
  const newPackageJson = {
    name: `@${name}/${dir}`,
    version,
    dependencies: {}
  }
  modules.forEach(module => {
    newPackageJson.dependencies[module] = dependencies[module]
  }
  )
  fs.writeFileSync(dir + '/package.json', JSON.stringify(newPackageJson, null, 2))
})
