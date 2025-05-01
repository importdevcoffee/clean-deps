import fs from 'fs';
import path from 'path';
import readline from 'readline';
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

export { confirmationDialog, loadPackageJson };
