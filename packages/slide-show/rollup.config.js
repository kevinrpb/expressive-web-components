import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import copy from 'rollup-plugin-copy';
import versionInjector from 'rollup-plugin-version-injector';

const version = process.env.npm_package_version;

// Static assets will vary depending on the application
const copyConfig = {
  targets: [
  ],
};

const plugins = [
  minifyHTML(),
  copy(copyConfig),
  resolve(),
  versionInjector(),
]

const minPlugins = [
  minifyHTML(),
  copy(copyConfig),
  resolve(),
  terser(),
  versionInjector(),
]

// The main JavaScript bundle for modern browsers that support
// JavaScript modules and other ES2015+ features.
const config = (plugins, outName) => ({
  input: 'slide-show.js',
  output: {
    file: `dist/${outName}`,
    format: 'es',
  },
  plugins: plugins,
  preserveEntrySignatures: false,
});

// if (process.env.NODE_ENV !== 'development') {
//   config.plugins.push(terser());
// }

export default [
  config(plugins, `slide-show_${version}.js`),
  config(minPlugins, `slide-show_${version}.min.js`)
];
