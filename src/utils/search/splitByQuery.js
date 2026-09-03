/** 移除空白並轉為小寫，供文字與關鍵字比對 */
const normalize = text =>
  String(text ?? '')
    .replace(/\s/g, '')
    .toLowerCase();

/**
 * 關鍵字在文字中的所有命中範圍
 * - 比對使用去除空白後的文字，範圍需換算回原字串的位置
 */
const getMatchRanges = (text, query) => {
  // 正規化後每個字元對應回原字串的起迄位置，供命中範圍換算
  const characterPositions = [];
  let normalizedText = '';
  let offset = 0;

  for (const character of text) {
    if (!/\s/.test(character)) {
      const normalizedCharacter = character.toLowerCase();
      normalizedText += normalizedCharacter;
      characterPositions.push(
        ...Array.from({ length: normalizedCharacter.length }, () => ({
          start: offset,
          end: offset + character.length
        }))
      );
    }

    offset += character.length;
  }

  // 逐次往後找，避免重疊命中
  const ranges = [];
  let searchFrom = 0;
  let matchIndex = normalizedText.indexOf(query, searchFrom);

  while (matchIndex !== -1) {
    ranges.push({
      start: characterPositions[matchIndex].start,
      end: characterPositions[matchIndex + query.length - 1].end
    });

    searchFrom = matchIndex + query.length;
    matchIndex = normalizedText.indexOf(query, searchFrom);
  }

  return ranges;
};

/**
 * 文字依關鍵字切成一般片段與命中片段，供標色顯示
 * - 比對忽略空白與大小寫，切出的片段為原字串，顯示內容不變
 * - 沒有關鍵字或未命中時回傳整段文字
 *
 * @param {String} text - 要比對的文字
 * @param {String} query - 搜尋關鍵字
 * @returns {Array} [{ text, matched }]
 */
const splitByQuery = (text, query) => {
  const source = String(text ?? '');
  const normalizedQuery = normalize(query);
  const ranges = normalizedQuery ? getMatchRanges(source, normalizedQuery) : [];

  if (!ranges.length) return [{ text: source, matched: false }];

  // 依命中範圍切片，範圍之間與最後一段命中之後的文字補為未命中片段
  return ranges.reduce((parts, range, index) => {
    const previousEnd = ranges[index - 1]?.end ?? 0;

    if (previousEnd < range.start) {
      parts.push({ text: source.slice(previousEnd, range.start), matched: false });
    }

    parts.push({ text: source.slice(range.start, range.end), matched: true });

    if (index === ranges.length - 1 && range.end < source.length) {
      parts.push({ text: source.slice(range.end), matched: false });
    }

    return parts;
  }, []);
};

export default splitByQuery;
