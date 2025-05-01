import { loadPackageJson } from './helper.js';

/**
 * Analyzes declared dependencies in `package.json` and returns those not present
 * in the given set of used modules (typically collected from source files and scripts).
 *
 * @param {Set<string>} usedModules - A set of module names that are used in the project.
 * @param {string} rootDir - The root directory of the project containing the `package.json` file.
 * @returns {Promise<string[]>} A promise resolving to an array of unused dependency names.
 */
async function findUnusedDependencies(usedModules, rootDir) {
  const pkg = loadPackageJson(rootDir);
  const declaredDependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const unused = Object.keys(declaredDependencies).filter(
    (dep) => !usedModules.has(dep),
  );

  return unused;
}

/**
 * Extracts dependencies mentioned inside npm/yarn scripts in `package.json`.
 *
 * This function scans the scripts section and detects if any declared dependency
 * names are directly referenced in the script commands.
 *
 * @param {string} rootDir - The root directory of the project containing the `package.json` file.
 * @returns {Set<string>} A set of dependency names that are used within npm scripts.
 */
function findUsedDependenciesFromScripts(rootDir) {
  const pkg = loadPackageJson(rootDir);
  const usedDeps = new Set();

  const scripts = pkg.scripts || {};

  // Get all dependencies listed in package.json
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  // Checking each script for dependencies
  Object.values(scripts).forEach((script) => {
    // Looping through all dependencies and checking if they appear in any script
    Object.keys(allDeps).forEach((dep) => {
      if (script.includes(dep)) {
        usedDeps.add(dep); // Now mark dependency as used if it's mentioned in the script
      }
    });
  });

  return usedDeps;
}

export { findUnusedDependencies, findUsedDependenciesFromScripts };
