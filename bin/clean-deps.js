#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'child_process';
import { scanImports } from '../src/scanner.js';
import {
  findUnusedDependencies,
  findUsedDependenciesFromScripts,
} from '../src/analyzer.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { confirmationDialog, checkDepsExist } from '../src/helper.js';

/**
 * Command: scan - Scans the current project for unused dependencies.
 *
 * Analyzes JavaScript/TypeScript imports and `package.json` scripts
 * to detect declared dependencies that are never used in the codebase.
 *
 * Options (Flags):
 * - `--ignore <deps>`: Comma-separated list of dependencies to exclude from reporting.
 * - `--clean`: Automatically uninstall unused dependencies by confirmation.
 * - `--all`: In combination with `--delete`-flag to remove *all* unused dependencies.
 * - `--yes`: Skip confirmation prompts before uninstalling.
 */
program
  .command('scan')
  .description('Scan project for unused dependencies.')
  .option('--ignore <deps>', 'Comma-separated list of dependencies to ignore.')
  .option('-c, --clean', 'Removes all unused dependencies after confirmation.')
  .option(
    '-s, --specify <deps>',
    'In combination with --clean it removes all unused dependencies.',
  )
  .option(
    '-y, --yes',
    'Skips confirmation dialog when deleting by using --yes.',
  )
  .action(async (options) => {
    const rootDir = process.cwd();

    // First collecting used dependencies from scripts and imports
    const usedFromScripts = findUsedDependenciesFromScripts(rootDir);
    const imports = await scanImports(rootDir);
    const usedDependencies = new Set([...usedFromScripts, ...imports]);

    console.log('Dependencies from script and imports which are in use:\n', [
      ...usedDependencies,
    ]);

    let unused = await findUnusedDependencies(usedDependencies, rootDir);

    if (options.ignore && options.specify) {
      console.warn(
        '⚠️ Both --ignore and --specify provided. --specify will take precedence.',
      );
    }

    // Based on ignore flag, filter out of the string[] the unused.
    if (options.ignore) {
      const ignored = options.ignore.split(',').map((d) => d.trim());
      checkDepsExist(ignored, unused, 'Specified');

      unused = unused.filter((dep) => !ignored.includes(dep));
    }

    //When specify flag is being used, keep only the specified in unused as a string[].
    if (options.specify) {
      const specified = options.specify
        .split(',')
        .map((d) => d.trim().toLowerCase());

      console.log('Unused dependencies:', unused);
      checkDepsExist(specified, unused, 'Specified');

      unused = specified;
    }

    // Report to the user that there are no unused dependencies
    if (unused.length === 0) {
      console.log('Unused: ', unused);
      console.log(chalk.green(`Found ${unused.length} unused dependencies.`));
      return;
    }

    console.log(chalk.yellow('Unused dependencies:'), [unused.join(', ')]);

    // Handle Cleanup
    if (options.clean) {
      if (!options.yes) {
        const confirm = await confirmationDialog(
          options.specify
            ? 'Are you sure you want to uninstall all unused dependencies?'
            : `Are you sure you want to uninstall ${unused.length} unused dependencies?`,
        );
        if (!confirm) {
          console.log(chalk.gray('Deletion aborted.'));
          return;
        }
      }

      const hasYarn = fs.existsSync(path.join(rootDir, 'yarn.lock'));
      const pkgManager = hasYarn ? 'yarn' : 'npm';
      const uninstallCmd = hasYarn
        ? `yarn remove ${unused.join(' ')}`
        : `npm uninstall ${unused.join(' ')}`;

      console.log(
        chalk.cyan(
          `Detected ${chalk.green(pkgManager)} as package manager. Uninstalling unused packages...`,
        ),
      );

      try {
        execSync(uninstallCmd, { stdio: 'inherit', cwd: rootDir });
        console.log(
          chalk.red(
            `Successfully removed ${unused.length} dependencies. Removed dependency list: ${unused}`,
          ),
        );
      } catch (err) {
        console.error(
          chalk.red('Failed to uninstall dependencies:'),
          err.message,
        );
      }
    }
  });

program.parse(process.argv);
