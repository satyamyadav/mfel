import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import lernaGetPackages from "lerna-get-packages";
import path from "path";

const { LERNA_PACKAGE_NAME, LERNA_ROOT_PATH } = process.env;
const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, "index.js");
const OUTPUT_DIR = path.join(PACKAGE_ROOT_PATH, "dist");
// const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, "package.json"));

// const ALL_MODULES = lernaGetPackages(LERNA_ROOT_PATH).map(
//   ({ package: { name } }) => name
// );

// console.log("ALL_MODULES", ALL_MODULES)

const LOCAL_GLOBALS = {
  'react': 'React',
  'react-dom': 'ReactDOM',
};

const LOCAL_EXTERNALS = [
  'react',
  'react-dom',
];

// const mirror = array =>
//   array.reduce((acc, val) => ({ ...acc, [val]: val }), {});

const formats = ["umd", "es", "cjs"];

export default formats.map(format => ({
  plugins: [
    nodeResolve({
      "jsnext:main": true,
      "browser:main": true
    }),
    commonjs({
      include: /node_modules/,
    }),
    babel({
      exclude: ["node_modules/**"],
      presets: [['@babel/preset-env', {'modules': false}], '@babel/react'],
      plugins: [['@babel/plugin-proposal-class-properties', { 'loose': true }]]
    }),
  ],
  input: INPUT_FILE,
  
  external: LOCAL_EXTERNALS,
  
  output: {
    file: path.join(OUTPUT_DIR, `index.${format}.js`),
    format, 
    sourcemap: true,
    name: LERNA_PACKAGE_NAME,
    amd: {
      id: LERNA_PACKAGE_NAME
    },
    globals: LOCAL_GLOBALS
  },
}));