import { program } from 'commander';
import { execSync } from 'child_process';
import { scanImports } from './scanner.js';
import {
  findUnusedDependencies,
  findUsedDependenciesFromScripts,
} from './analyzer.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { confirmationDialog } from './helper.js';

/**
 * @command scan - Scans the current project for unused dependencies.
 *
 * Analyzes JavaScript/TypeScript imports and `package.json` scripts
 * to detect declared dependencies that are never used in the codebase.
 *
 * @options Options:
 * - `--ignore <deps>`: Comma-separated list of dependencies to exclude from reporting.
 * - `--clean`: Automatically uninstall unused dependencies by confirmation.
 * - `--all`: In combination with `--delete`-flag to remove *all* unused dependencies.
 * - `--yes`: Skip confirmation prompts before uninstalling.
 */
program
  .command('scan')
  .description('Scan project for unused dependencies.')
  .option('--ignore <deps>', 'Comma-separated list of dependencies to ignore.')
  .option('--clean <deps>', 'Automatically remove all unused dependencies.')
  .option(
    '--all',
    'In combination with --clean it removes all unused dependencies.',
  )
  .option('--yes', 'Skips confirmation dialog when deleting by using --yes.')
  .action(async (options) => {
    const rootDir = process.cwd();

    // First collecting used dependencies from scripts and imports
    const usedFromScripts = findUsedDependenciesFromScripts(rootDir);
    const imports = await scanImports(rootDir);
    const usedDependencies = new Set([...usedFromScripts, ...imports]);

    let unused = await findUnusedDependencies(usedDependencies, rootDir);

    // Apply based on ignore flag, filter out of the unused.
    if (options.ignore) {
      const ignored = options.ignore.split(',').map((d) => d.trim());
      unused = unused.filter((dep) => !ignored.includes(dep));
    }

    // Report unused dependencies
    if (unused.length === 0) {
      console.log(chalk.green(`Found ${unused.length} unused dependencies.`));
      return;
    }

    console.log(chalk.yellow('Unused dependencies:'), unused.join(', '));

    // Handle Cleanup
    if (options.clean) {
      if (!options.yes) {
        const confirm = await confirmationDialog(
          options.all
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
          chalk.red(`Successfully removed ${unused.length} dependencies.`),
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
