# ezh-demo
Demos and examples for frontend frame "ezh".

### Debug packages
The npm packages `ezh` `ezh-model` `justrun-ws` projects are mapped into the src folder as git submodules, and act as packages by fake package.json files.

To debug them, replace the dependencies version with file links:

```
// package.json
{
  ...
  "dependencies": {
    "ezh": "file:./src/ezh",
    "ezh-model": "file:./src/ezh-model",
    "justrun-ws": "file:./src/justrun-ws",
    "path-parser": "^6.1.0"
  }
}
```

### Warning
`ezh-model` depends on `ezh` as peerDependencies, to ensure there's only one ezh instance for the app, make sure never install an `ezh` package into `ezh-model` project. To verify, double check if there is an "ezh" folder in ezh-model/node_modules folder.
