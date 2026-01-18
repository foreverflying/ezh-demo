# ezh-demo

Demos and examples for the `ezh` frontend framework.

## Debugging Local Packages

The packages `ezh`, `ezh-model`, `justrun-ws`, and `justrun-loader` are included as git submodules under `src/`, with stub `package.json` files to act as local packages.

To debug them locally, update your dependencies to use file links:

```json
// package.json
{
  "dependencies": {
    "ezh": "file:./src/ezh",
    "ezh-model": "file:./src/ezh-model",
    "justrun-loader": "file:./src/justrun-loader",
    "justrun-ws": "file:./src/justrun-ws"
  }
}
```

### ⚠️ Important

These packages have peer dependencies on each other:
- `ezh-model` → `ezh`
- `justrun-loader` → `ezh-model`, `justrun-ws`

Ensure each package has only one global instance. Run `npm run clean` to remove any duplicate modules.
