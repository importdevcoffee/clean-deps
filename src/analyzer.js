import { loadPackageJson } from './helper.js';
import fs from 'fs';
import path from 'path';

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

  const binMap = new Map(); // Map<binaryName, depName>

  //Resolving the path of package.json of each dep in node_modules
  for (const depName of Object.keys(allDeps)) {
    const depPkgPath = path.join(
      rootDir,
      'node_modules',
      depName, //includes scoped packages, like @orgname/package-name
      'package.json',
    );

    if (fs.existsSync(depPkgPath)) {
      try {
        const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf-8'));
        const binField = depPkg.bin;

        // There are two common ways in a package.json which needs to be handled.
        // e.g., "bin": "dep_name_string" and "bin": {"binKey": "binValue"}
        //if bin field is a string (single binary), map to package-name
        //if bin field is an object (multiple binaries), map each bin-name to package
        if (typeof binField === 'string') {
          binMap.set(depName, depName);
        } else if (typeof binField === 'object') {
          for (const [binName] of Object.entries(binField)) {
            binMap.set(binName, depName);
          }
        }
      } catch {
        //If reading package.json fails, skipping this dep.
      }
    }
  }

  //for each script in package.json, check if any bin name is referenced
  Object.values(scripts).forEach((script) => {
    for (const [binName, depName] of binMap.entries()) {
      if (script.includes(binName)) {
        //if script includes bin name, mark corresponding dependency as used
        usedDeps.add(depName);
      }
    }

    //checking for any declared dependency appearing directly in scripts
    for (const depName of Object.keys(allDeps)) {
      if (script.includes(depName)) {
        //if script includes then dep-name will be marked as used
        usedDeps.add(depName);
      }
    }
  });

  return usedDeps;
}

export { findUnusedDependencies, findUsedDependenciesFromScripts };
