import { compileSource } from './transformer.js';

/** Normalize indentation and whitespace without rewriting expressions or literals. */
export function formatSource(source, { tabSize = 4 } = {}) {
  if (!Number.isInteger(tabSize) || tabSize < 1 || tabSize > 8) throw new RangeError('들여쓰기 폭은 1~8 사이의 정수여야 합니다.');
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const expanded = source.replace(/^[ \t]*\t[ \t]*/gm, prefix => {
    let width = 0;
    for (const c of prefix) width += c === '\t' ? tabSize - width % tabSize : 1;
    return ' '.repeat(width);
  });
  compileSource(expanded); // Refuse to guess the intended structure of invalid code.
  const levels = [0];
  const output = [];
  for (const raw of expanded.split(/\r?\n/)) {
    const text = raw.trim();
    if (!text) { if (output.length && output.at(-1) !== '') output.push(''); continue; }
    const indent = raw.length - raw.trimStart().length;
    if (text.startsWith('#')) {
      const depth = levels.filter(level => level < indent).length;
      output.push(' '.repeat(depth * tabSize) + text); continue;
    }
    while (levels.at(-1) > indent) levels.pop();
    if (indent > levels.at(-1)) levels.push(indent);
    output.push(' '.repeat((levels.length - 1) * tabSize) + raw.trimStart().trimEnd());
  }
  while (output.at(-1) === '') output.pop();
  return output.length ? output.join(eol) + eol : '';
}
