import fs from 'fs';
import fg from 'fast-glob';
import * as acorn from 'acorn';

/**
 * Scans for JavaScript, TypeScript, and ES module files in the current project directory
 * and returns a list of all external module imports.
 *
 * This includes both ES module `import` statements and CommonJS `require()` calls,
 * and excludes relative imports (i.e., ones starting with `.`).
 *
 * @async
 * @function scanImports
 * @param {string} rootDir - Root directory of the project which is getting scanned.
 * @returns {Promise<string[]>} Promise resolves to an array of imported module names.
 */
export async function scanImports(rootDir) {
  const files = await fg(['**/*.{js,ts,cjs,mjs}'], {
    cwd: rootDir,
    ignore: ['node_modules/**'],
    absolute: true,
  });

  const imported = new Set();

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf-8');
    let ast;

    try {
      ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
    } catch {
      continue;
    }

    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration') {
        imported.add(node.source.value);
      }
      if (
        node.type === 'VariableDeclaration' &&
        node.declarations.length &&
        node.declarations[0].init &&
        node.declarations[0].init.type === 'CallExpression' &&
        node.declarations[0].init.callee.name === 'require'
      ) {
        const arg = node.declarations[0].init.arguments[0];
        if (arg && typeof arg.value === 'string') {
          imported.add(arg.value);
        }
      }

      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.object.type === 'CallExpression' &&
        node.expression.callee.object.callee.name === 'require'
      ) {
        const arg = node.expression.callee.object.arguments[0];
        if (arg && typeof arg.value === 'string') {
          imported.add(arg.value);
        }
      }

      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'CallExpression' &&
        node.expression.callee.name == 'require'
      ) {
        const arg = node.expression.arguments[0];
        if (arg && typeof arg.value === 'string') {
          imported.add(arg.value);
        }
      }
    }
  }

  return [...imported].filter((name) => !name.startsWith('.'));
}
