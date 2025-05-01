# @importdevcoffee/clean-deps

**clean-deps** is a fast CLI tool for scanning and cleaning unused dependencies in your Node.js and TypeScript projects. Unused `import` or `require` statements can be deleted with a simple flag.

Ideal for keeping your projects lean, production-ready, and free from bloat.

---

## ✨ Features

- Detects unused `dependencies` and `devDependencies` from your `package.json`
- Scans your project for actual usage of modules with `scan`
- Optionally removes:
- Cleanup the unused dependencies with (`--clean`)
  - Additionally use (`--all`) if you want to delete all unused dependencies at once
  - Use (`--yes`) to skip the confirmation dialog and delete without any furhter questions
  <!-- IN PROGRESS: - `console.log` statements (`--strip-logs`)  -->
- Works with both **JavaScript** and **TypeScript**

---

## 📦 Installation

```bash
npm install @importdevcoffee/clean-deps
```
