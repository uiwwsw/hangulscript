import { compileSentences } from './sentences.js';

/** HangulScript has one syntax: indentation-based Korean sentences. */
export function compileSource(source) {
  if (typeof source !== 'string') throw new TypeError('한글스크립트 소스는 문자열이어야 합니다.');
  return compileSentences(source);
}
