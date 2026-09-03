---
to: 'config/workspace/<%=workspace%>.js'
---
import { createPage } from '../modules/page.js';

const pages = [
  createPage('<%=workspace%>/index.js', '<%=workspace%>/index.html', '<%=title%>', '<%=workspace%>')
];

export default {
  name: '<%=workspace%>',
  spa: true,
  pages,
  outputPath: 'dist',
  jsPath: 'assets/js',
  assetsPath: 'assets',
  chunkVendors: ['axios', 'dayjs'],
  publicPath: config =>
    config.preview.status ? `/${config.preview.project}` : `${config.path.publicPath || '/'}<%=workspace%>/`
};
