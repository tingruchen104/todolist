import { createPage } from '../modules/page.js';

const pages = [
  createPage('short-url/index.js', 'short-url/index.html', '短網址', 'short-url')
];

export default {
  name: 'short-url',
  spa: true,
  pages,
  outputPath: 'dist',
  jsPath: 'assets/js',
  assetsPath: 'assets',
  chunkVendors: ['axios', 'dayjs'],
  publicPath: config =>
    config.preview.status
      ? `/${config.preview.project}`
      : `${config.path.publicPath || '/'}c-backstage/short-url/`
};
