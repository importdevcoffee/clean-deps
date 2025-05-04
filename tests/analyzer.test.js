import { afterEach, beforeEach, expect, test } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { findUnusedDependencies } from '../src/analyzer';
import { scanImports } from '../src/scanner';

let tempDir;

beforeEach(async () => {
  //Creating temporary directory
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analyzer-fixture-'));

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
});

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('detects unused dependency via findUnusedDependencies', async () => {
  const usedDep = new Set(await scanImports(tempDir));
  const unusedDep = await findUnusedDependencies(usedDep, tempDir);
  expect(unusedDep).toContain('unused-package');
  expect(unusedDep).not.toContain('chalk');
});
