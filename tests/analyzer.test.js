import { afterEach, beforeEach, expect, test } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import {
  findUnusedDependencies,
  findUsedDependenciesFromScripts,
} from '../src/analyzer';
import { scanImports } from '../src/scanner';

let tempDir;

beforeEach(async () => {
  //Creating temporary directory
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analyzer-fixture-'));
});

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('detects unused dependency via findUnusedDependencies', async () => {
  //fake content for file
  const jsContent = `import chalk from 'chalk';\n
                    console.log(chalk.green('Hello from index.js!'))`;

  await fs.writeFile(path.join(tempDir, 'index.js'), jsContent, 'utf-8');

  //fake package.json
  const fakePkg = {
    name: 'fixture-basic',
    version: '1.0.0',
    type: 'module',
    scripts: { start: 'node index.js' },
    dependencies: { chalk: '^5.0.0', 'unused-package': '^1.0.0' },
  };

  await fs.writeFile(
    path.join(tempDir, 'package.json'),
    JSON.stringify(fakePkg, null, 2), //null, 2 for pretty-print of the output with 2 spaces for indentation
  );

  const usedDep = new Set(await scanImports(tempDir));
  const unusedDep = await findUnusedDependencies(usedDep, tempDir);
  expect(unusedDep).toContain('unused-package');
  expect(unusedDep).not.toContain('chalk');
});

test('detects unused dependencies in npm script via the binary name', async () => {
  const fakeRootPkg = {
    name: 'test-scoped-bin',
    version: '1.0.0',
    scripts: { scan: 'test-clean-deps scan' },
    dependencies: { '@orgname/test-clean-deps': '1.0.0' },
  };

  await fs.writeFile(
    path.join(tempDir, 'package.json'),
    JSON.stringify(fakeRootPkg, null, 2),
  );

  //Now we want to create a fake node_modules/@orgname/clean-deps/package.json folder/file
  const depPath = path.join(
    tempDir,
    'node_modules',
    '@orgname',
    'test-clean-deps',
  );
  await fs.mkdir(depPath, { recursive: true });

  const scopedDepPkg = {
    name: '@orgname/test-clean-deps',
    version: '1.0.0',
    bin: { 'test-clean-deps': './bin/fake-test-clean-deps.js' },
  };

  await fs.writeFile(
    path.join(depPath, 'package.json'),
    JSON.stringify(scopedDepPkg, null, 2),
  );

  const usedDeps = findUsedDependenciesFromScripts(tempDir);

  expect(usedDeps.has('@orgname/test-clean-deps')).toBe(true);
});
