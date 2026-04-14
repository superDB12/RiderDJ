const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force react-native-screens to use compiled JS output instead of TypeScript source.
// The package's "react-native" field points to "src/index" (TS source), which triggers
// @react-native/babel-plugin-codegen on fabric component files that use Flow-only types
// (CodegenTypes), causing "Unknown prop type: undefined" errors.
// Locate react-native-screens package dir (may be in workspace root node_modules)
const rnScreensPkgDir = (() => {
  for (const base of [projectRoot, workspaceRoot]) {
    try {
      const p = require.resolve('react-native-screens/package.json', { paths: [base] });
      return path.dirname(p);
    } catch (_) {}
  }
  return null;
})();

if (rnScreensPkgDir) {
  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-native-screens') {
      return {
        filePath: path.join(rnScreensPkgDir, 'lib/commonjs/index.js'),
        type: 'sourceFile',
      };
    }
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;