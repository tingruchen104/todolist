// terminal 文字顏色
import 'colors';

import tagService from './workspace/tag-service.js';
import shortUrl from './workspace/short-url.js';
import prototypes from './workspace/prototypes.js';

const workspaceMap = {
  'tag-service': tagService,
  'short-url': shortUrl,
  prototypes
};

const workspacePages = [...tagService.pages, ...shortUrl.pages];

const emptyWorkspace = {
  name: '',
  pages: [],
  singleFile: true, // SPA only
  outputPath: 'dist',
  jsPath: 'assets/js',
  assetsPath: 'assets',
  publicPath: () => '/',
  chunkVendors: []
};

/** 依 workspace 環境變數取得對應設定；未指定時整合所有頁面。 */
export default function getWorkspace(env = process.env) {
  const name = env.workspace || process.env.workspace;

  let workspace;

  if (name && workspaceMap[name]) {
    workspace = workspaceMap[name];
  } else {
    workspace = {
      ...emptyWorkspace,
      pages: workspacePages,
      name: 'default'
    };
  }

  return workspace;
}

export { workspaceMap };
