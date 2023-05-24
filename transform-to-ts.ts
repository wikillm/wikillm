// @ts-nocheck

// create a script in mjs format
// that scans a directory using ts-morph looking for js files
// and converts them to ts/tsx files
// and writes them to a new directory
import { parseSync } from '@babel/core';

import { Project, SourceFile, ts } from 'ts-morph';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import jscodeshift from 'jscodeshift';

const j = (code) =>
  jscodeshift(code, {
    parser: {
      parse: (source) =>
        parseSync(source, {
          plugins: [
            `@babel/plugin-syntax-jsx`,
            `@babel/plugin-proposal-class-properties`,
          ],
          overrides: [
            {
              test: [`**/*.ts`, `**/*.tsx`],
              plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
            },
          ],
          filename: 'source-file.tsx', // this defines the loader depending on the extension
          parserOpts: {
            tokens: true, // recast uses this
          },
        }),
    },
  });

const project = new Project({
  tsConfigFilePath: join(process.cwd(), './tsconfig.json'),
});

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
  return string.charAt(0).toUpperCase() + string.slice(1);
};
// @ts-disable
function convertToNamedFunction(source: string) {
  const root = j(source);
  root
    .find(j.VariableDeclaration)
    .filter((path) =>
      path.node.declarations.some(
        (declaration) =>
          declaration.init &&
          declaration.init.type === 'ArrowFunctionExpression'
      )
    )
    .forEach((path) => {
      path.node.declarations.forEach((declaration) => {
        if (
          declaration.init &&
          declaration.init.type === 'ArrowFunctionExpression'
        ) {
          const functionName = declaration.id.name;
          const functionBody = declaration.init.body;
          const functionParams = declaration.init.params;

          // Create a named function declaration with the arrow function's body and parameters
          const namedFunction = j.functionDeclaration(
            j.identifier(functionName),
            functionParams,
            functionBody
          );

          // Replace the variable declaration with the named function declaration
          j(path).replaceWith(namedFunction);
        }
      });
    });

  return root.toSource();
}
const i = 0;
function addTypehole(source) {
  const root = j(source);

  root
    .find(j.FunctionDeclaration, { body: { type: 'BlockStatement' } })
    .forEach((path) => {
      const { name } = path.node.id;
      path.insertBefore(`export interface ${upperFirstLetter(name)}Props {}`);
      // const newName = `_${name}`

      // // Change the name node value to the original node value prepended by '_'
      // path.node.id.name = newName
      //     root.get().node.program.body.unshift(`
      // type ${upperFirstLetter(name)}Props = any
      // export function ${name} (...args) {
      //   const typedArgs:${upperFirstLetter(name)}Props = typehole.t${i++}(args[0])
      //   return ${newName}(...args)
      // }`)

      // Insert the new AST nodes after the modified function declaration
    });
  // root.get().node.program.body.unshift('import typehole from "typehole"\n')
  return root.toSource();
}

// a function that takes a ts-morph project and a path
// and checks if file has jsx syntax
// and if it does, it returns true
// and if it doesn't, it returns false
const hasJsx = (file: SourceFile) => {
  const jsx: any = file.getDescendantsOfKind(ts.SyntaxKind.JsxElement);
  jsx.push(...file.getDescendantsOfKind(ts.SyntaxKind.JsxSelfClosingElement));
  return jsx.length > 0;
};

const sourceDir = process.cwd();
const targetDir = join(process.cwd(), 'src/');

const files = project.getSourceFiles('**/*.js');
console.log(files);
const filesToWrite: any[] = [];

files.forEach((file) => {
  console.log(file.getFilePath());
  const sourceFile = project.getSourceFile(file.getFilePath()) as SourceFile;
  try {
    const target = addTypehole(
      convertToNamedFunction(sourceFile.getFullText())
    );

    const targetPath = join(
      targetDir,
      file
        .getFilePath()
        .replace(sourceDir, '')
        .replace('.js', hasJsx(file) ? '.tsx' : '.ts')
    );

    console.log(targetPath);
    const targetDirname = targetPath.split('/').slice(0, -1).join('/');
    if (!existsSync(targetDirname)) {
      mkdirSync(targetDirname, { recursive: true });
    }
    writeFileSync(targetPath, target);
    // rmSync(file.getFilePath())

    execSync(`npx prettier --write ${targetPath}`);
    // filesToWrite.push({ targetPath, target })
  } catch (e) {
    console.log('error', e);
  }
});

// filesToWrite.forEach(({ targetPath, target }) => {
// })

console.log('done');
