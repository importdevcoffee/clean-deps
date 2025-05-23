import fs from 'fs';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';
/**
 * This function provides an easy way to get a confirmation of the user, by asking a simple yes/no question, within the terminal.
 *
 * @param {string} question - Confirmation message to display to the user.
 * @returns {Promise<boolean>} - Resolves to true if the user answers 'y', otherwise false.
 */
function confirmationDialog(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

/**
 * Helper function for loading and parsing the `package.json` file from the given root directory.
 *
 * @param {string} rootDir - Root directory of the project.
 * @returns {object} Parsed JSON object from the `package.json`.
 */
function loadPackageJson(rootDir) {
  const pkgPath = path.join(rootDir, 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
}

/**
 * Validates that all dependencies in the provided list exist within the list of unused dependencies.
 *
 * @function checkDepsExist - Validation logic for dependencies which are provided via --ignore or --specify.
 *
 * @param {string[]} depsToCheck - List of strings with dependencies to validate.
 * @param {string[]} unusedDeps - List of strings with currently undetected dependencies.
 * @param {string} label - Label for the flag used in the error message to indicate the source (e.g., "Ignored", "Specified" etc.)
 *
 * @throws Throw an error if any dependency in `depsToCheck` is not found in `unusedDeps`
 */

function checkDepsExist(depsToCheck, unusedDeps, label) {
  depsToCheck.forEach((dep) => {
    if (!unusedDeps.includes(dep)) {
      console.log(chalk.yellow(`Dependency not found: ${dep}`));
      throw new Error(
        `${label} dependency "${dep}" is not found in the unused dependencies list.`,
      );
    }
  });
}

export { confirmationDialog, loadPackageJson, checkDepsExist };
