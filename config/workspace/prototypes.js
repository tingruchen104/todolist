import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  {
    entry: path.resolve(__dirname, '../../prototypes/index.js'),
    template: 'templates/prototypes/index.html',
    title: 'Prototype',
    chunkName: 'prototypes',
    name: 'prototypes',
    appName: 'app'
  }
];

export default {
  name: 'prototypes',
  spa: true,
  pages,
  outputPath: 'dist',
  jsPath: 'assets/js',
  assetsPath: 'assets',
  chunkVendors: ['axios', 'dayjs'],
  publicPath: config =>
    config.preview.status
      ? `/${config.preview.project}`
      : `${config.path.publicPath || '/'}prototypes/`
};
