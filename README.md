# @importdevcoffee/clean-deps

## 🧹 clean-deps

**clean-deps** is a fast and lightweight CLI-tool for scanning and removing unused dependencies in your Node.js and TypeScript projects. It detects unused `import` and `require` statements and lets you clean them up with a simple flag.

Perfect for keeping your codebase clean, lean, production-ready and free from unnecessary bloat.

---

## ✨ Features

- **Detects unused** `dependencies` and `devDependencies` from your `package.json`
- **Scan your project** for actual module usage (imports + script binaries) using the `scan` command
- **Remove unused dependencies** automatically with:
  - Uninstall all unused dependencies by using `--clean` or `-c`.

    Want to only uninstall the specified dependencies when using `--clean`? Use in addition `--specify <deps>` or `-s`
    - **Example:**

      ```bash
      clean-deps scan --clean --specify dep1,dep2,dep3
      ```

  - Want to ignore dependencies and make sure that they arent getting uninstalled? Use in addition `--ignore`
    - **Example:**

      ```bash
      clean-deps scan --clean --ignore dep2,dep3
      ```

  - Want to skip the confirmation dialog when cleaning/deleting? Use `--yes` or `-y`.
    - **Example:**

      ```bash
      clean-deps scan --clean --yes
      ```

- Works with both **JavaScript** and **TypeScript**

---

## 📦 Installation

*Note:* It is highly recommended to install clean-deps with the `--save-dev` flag.

```bash
npm install @importdevcoffee/clean-deps --save-dev
```

You can use your terminal and run the cli-tool from your project directory by using:

```bash
npx clean-deps scan [options]
```

Want to create convenient shortcuts? You can add entries to your scripts inside of your package.json.

**For example:**

```bash
"scripts": 
          {
            "scan": "clean-deps scan",
            "scan:clean": "clean-deps scan --clean",
            "scan:autoclean": "clean-deps scan -c -y",
            ...
          }
```

You can then simply run the script by using `npm run scan` which will automatically execute the configured command.

---

## Example

Use this command in your terminal, inside of your project:

```bash
npx clean-deps scan
```

Expect an output similar to this:

```text
Dependencies from script and imports which are in use:
["dep1",    "dep2"
 "dep3",    "dep4",
 ...        ...
]
Unused: []
Found 0 unused dependencies.
```

---

## **Flag Representation in Table-format**

### Flags

| Flag              | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `--clean`, `-c`   | Cleanup/uninstall your dependecies                   |
| `--specify`, `-s` | Specify which unused dependencies you want to remove |
| `--yes`, `-y`     | Skip confirmation dialog before deleting             |
| `--ignore`        | Ignore specific dependencies from being removed      |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE)

---

## 🙌 Contributing

Found a bug or want to improve this tool? PRs and issues are always welcome.
