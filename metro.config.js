const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration optimized for performance
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Enable tree shaking for better bundle size
    unstable_enablePackageExports: true,
    // Optimize asset resolution
    assetExts: [
      'bin',
      'txt',
      'jpg',
      'png',
      'json',
      'svg',
      'ttf',
      'otf',
      'woff',
      'woff2',
    ],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  transformer: {
    // Enable minification in production
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
    // Optimize asset processing
    assetPlugins: ['react-native-svg-transformer'],
    // Enable hermes for better performance
    hermesParser: true,
    // Optimize for mobile
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  serializer: {
    // Optimize bundle splitting
    createModuleIdFactory() {
      return function (path) {
        // Use shorter module IDs to reduce bundle size
        return path
          .replace(__dirname, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 20);
      };
    },
    // Filter out unnecessary modules
    processModuleFilter: (module) => {
      return !module.path.includes(
        'node_modules/react-native/Libraries/NewAppScreen'
      );
    },
  },
  // Performance optimizations
  cacheStores: [
    {
      name: 'filesystem',
      options: {
        path: './metro-cache',
      },
    },
  ],
  // Enable parallel processing
  maxWorkers: Math.max(1, require('os').cpus().length - 1),
  // Optimize file watching
  watchFolders: [],
  // Reduce memory usage
  resetCache: false,
  // Enable source maps for debugging
  getSourceMapURL: (bundlePath) => {
    return `${bundlePath}.map`;
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
