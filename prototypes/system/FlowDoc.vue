<template>
  <div class="p-6">
    <RouterLink to="/" class="text-label mb-4 inline-block text-sm underline">← 回列表</RouterLink>

    <article v-if="html" class="flow-doc" v-html="html" />
    <div v-else class="text-label py-8">找不到操作流程文件：{{ name }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const name = computed(() => route.params.name);

// flow.md 以原始字串載入，於前端渲染（不依賴任何 markdown 套件）
const docs = import.meta.glob('/prototypes/views/*/flow.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

const escapeHtml = text =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 行內語法：粗體、行內程式碼、連結
const inline = text =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code class="flow-inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a class="flow-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

// 區塊語法：標題、清單、表格、程式碼區塊、分隔線、段落
const renderMarkdown = src => {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const isFence = line => /^```/.test(line.trim());
  const isHeading = line => /^#{1,6}\s/.test(line);
  const isHr = line => /^(-{3,}|\*{3,})$/.test(line.trim());
  const isOl = line => /^\s*\d+\.\s+/.test(line);
  const isUl = line => /^\s*[-*]\s+/.test(line);

  while (i < lines.length) {
    const line = lines[i];

    if (isFence(line)) {
      const buf = [];
      i += 1;
      while (i < lines.length && !isFence(lines[i])) {
        buf.push(escapeHtml(lines[i]));
        i += 1;
      }
      i += 1; // 略過結尾 ```
      out.push(`<pre class="flow-code"><code>${buf.join('\n')}</code></pre>`);
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level} class="flow-h flow-h${level}">${inline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    if (isHr(line)) {
      out.push('<hr class="flow-hr" />');
      i += 1;
      continue;
    }

    // 表格：本行含 |，下一行為分隔列（含 - 與 |）
    const next = lines[i + 1] ?? '';
    if (line.includes('|') && next.includes('-') && /^[\s:|-]+$/.test(next.trim())) {
      const parseRow = row =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim());
      const headers = parseRow(line);
      i += 2;
      const body = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        body.push(parseRow(lines[i]));
        i += 1;
      }
      const thead = `<tr>${headers.map(c => `<th>${inline(c)}</th>`).join('')}</tr>`;
      const tbody = body
        .map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`)
        .join('');
      out.push(`<table class="flow-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`);
      continue;
    }

    if (isOl(line)) {
      const items = [];
      while (i < lines.length && isOl(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ol class="flow-ol">${items.join('')}</ol>`);
      continue;
    }

    if (isUl(line)) {
      const items = [];
      while (i < lines.length && isUl(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ul class="flow-ul">${items.join('')}</ul>`);
      continue;
    }

    // 段落：連續非空白、非區塊起始行
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !isHeading(lines[i]) &&
      !isFence(lines[i]) &&
      !isHr(lines[i]) &&
      !isOl(lines[i]) &&
      !isUl(lines[i])
    ) {
      para.push(inline(lines[i].trim()));
      i += 1;
    }
    if (para.length) out.push(`<p class="flow-p">${para.join('<br />')}</p>`);
  }

  return out.join('\n');
};

const html = computed(() => {
  const raw = docs[`/prototypes/views/${name.value}/flow.md`];
  return raw ? renderMarkdown(raw) : '';
});
</script>

<style scoped>
.flow-doc {
  max-width: 52rem;
  color: var(--color-text-heading, #1f1f1f);
  line-height: 1.7;
}

.flow-doc :deep(.flow-h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.flow-doc :deep(.flow-h2) {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 1.75rem 0 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-border-base, #e5e5e5);
}

.flow-doc :deep(.flow-h3) {
  font-size: 1rem;
  font-weight: 700;
  margin: 1.25rem 0 0.5rem;
}

.flow-doc :deep(.flow-p) {
  margin: 0.5rem 0;
}

.flow-doc :deep(.flow-ul),
.flow-doc :deep(.flow-ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.flow-doc :deep(.flow-ul) {
  list-style: disc;
}

.flow-doc :deep(.flow-ol) {
  list-style: decimal;
}

.flow-doc :deep(li) {
  margin: 0.25rem 0;
}

.flow-doc :deep(.flow-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.875rem;
}

.flow-doc :deep(.flow-table th),
.flow-doc :deep(.flow-table td) {
  border: 1px solid var(--color-border-base, #e5e5e5);
  padding: 0.5rem 0.75rem;
  text-align: left;
  vertical-align: top;
}

.flow-doc :deep(.flow-table th) {
  background: var(--color-primary-10, #fff1e5);
  font-weight: 700;
}

.flow-doc :deep(.flow-code) {
  background: var(--color-fill-quaternary, #f5f5f5);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  font-size: 0.8125rem;
  margin: 0.75rem 0;
}

.flow-doc :deep(.flow-inline-code) {
  background: var(--color-fill-quaternary, #f5f5f5);
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  font-size: 0.85em;
}

.flow-doc :deep(.flow-link) {
  color: var(--color-primary, #ff7800);
  text-decoration: underline;
}

.flow-doc :deep(.flow-hr) {
  border: none;
  border-top: 1px solid var(--color-border-base, #e5e5e5);
  margin: 1.5rem 0;
}
</style>
