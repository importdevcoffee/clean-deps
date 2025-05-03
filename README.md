# @importdevcoffee/clean-deps

**clean-deps** is a fast CLI tool for scanning and cleaning unused dependencies in your Node.js and TypeScript projects. Unused `import` or `require` statements can be deleted with a simple flag.

Ideal for keeping your projects lean, production-ready, and free from bloat.

---

## ✨ Features

- Detects unused `dependencies` and `devDependencies` from your `package.json`
- Scans your project for actual usage of modules with `scan`
- Optionally removes:
- Cleanup all the unused dependencies with (`--clean`)
  - If you want to specify which dependencies you want to delete, use `-s` or `--specify <deps>`
    - Example: `clean-deps --clean --specify dep1,dep2,dep3,dep4,...`
  - Use (`--yes`) to skip the confirmation dialog and delete without any furhter questions
  <!-- IN PROGRESS: - `console.log` statements (`--strip-logs`)  -->
- Works with both **JavaScript** and **TypeScript**

---

## 📦 Installation

*Note:* It is highly recommended to install clean-deps with the `--save-dev` flag.

```bash
npm install @importdevcoffee/clean-deps --save-dev
```
