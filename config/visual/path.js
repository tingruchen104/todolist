import 'colors';
import Table from 'cli-table';

/** 將目前 workspace 的頁面名稱與 HTML path 輸出至 build terminal。 */
export function printPath({ workspace, config }) {
  const table = new Table({ head: ['No'.green, 'Name'.green, 'Path'.green] });
  table.push(...workspace.pages.map((page, i) => [`${i + 1}`, `${page.name}`, `${page.template}`]));
  const heading = `目前環境工作區頁面(${config.workspace.current})`.bgGreen.black;

  process.stdout.write(`${heading}\n${table.toString()}\n${'Start Compiling ... \n\n'.yellow}\n`);
}
