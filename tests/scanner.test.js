import { afterEach, beforeEach, expect, test } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { scanImports } from '../src/scanner';

let tempDir;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scan-fixture-'));

  const jsContent = `import chalk from 'chalk'\n
                    const fg = require('fast-glob');
                    require('dotenv').config();
                    `;

  await fs.writeFile(path.join(tempDir, 'index.js'), jsContent, 'utf-8');
});

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('scanImports scans for external modules via import and require inside of a code file', async () => {
  const result = await scanImports(tempDir);
  expect(result).toContain('chalk');
  expect(result).toContain('fast-glob');
  expect(result).toContain('dotenv');
});
