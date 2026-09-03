module.exports = {
  prompt: async ({ prompter }) => {
    // 先取得 workspace，後續才能用它產生 chunkname 預設值。
    const base = await prompter.prompt([
      {
        type: 'input',
        name: 'workspace',
        message: '請輸入 workspace 名稱'
      },
      {
        type: 'input',
        name: 'title',
        message: '請輸入 workspace title'
      }
    ]);

    const { workspace } = base;
    const defaultChunk = `${workspace}`;

    // workspace 確定後再詢問 chunkname 與頁面功能選項。
    const rest = await prompter.prompt([
      {
        type: 'input',
        name: 'chunkname',
        message: '請輸入 chunkname 名稱',
        initial: defaultChunk
      },
      {
        type: 'confirm',
        name: 'useRouter',
        message: 'Use vue-router?',
        initial: true
      },
      {
        type: 'confirm',
        name: 'useStore',
        message: 'Use pinia store?',
        initial: true
      }
    ]);

    return { ...base, ...rest };
  }
};
