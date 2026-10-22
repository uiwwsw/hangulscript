import ts from 'typescript';

const hints = {
  2304: '이름을 먼저 선언했는지 확인하세요.',
  2307: '모듈 경로와 파일이 있는지 확인하세요.',
  2322: '선언한 타입과 대입한 값의 타입을 확인하세요.',
  2339: '이 값에 해당 속성이나 메서드가 있는지 확인하세요.',
  2345: '함수에 전달한 값의 타입을 확인하세요.',
  2554: '함수에 전달하는 인자의 개수를 확인하세요.',
  7006: '공개 함수의 매개변수 타입을 명시하세요.'
};

export class HangulScriptError extends Error {
  constructor(diagnostics) {
    super(formatSourceDiagnostics(diagnostics));
    this.name = 'HangulScriptError';
    this.diagnostics = diagnostics;
  }
}

export function syntaxDiagnostic(error, source, filePath) {
  const lines = source.split(/\r?\n/);
  const match = error.message.match(/^(\d+)행: /);
  const line = match ? Number(match[1]) : Math.max(1, lines.findLastIndex(line => line.trim()) + 1);
  const text = lines[line - 1] ?? '';
  return { filePath, line, column: text.length - text.trimStart().length + 1, length: Math.max(1, text.trim().length), code: 'HGS1001', message: error.message.replace(/^\d+행: /, ''), severity: 'error' };
}

export function mapDiagnostic(diagnostic, documents) {
  const file = diagnostic.file;
  const position = file && diagnostic.start !== undefined ? file.getLineAndCharacterOfPosition(diagnostic.start) : { line: 0, character: 0 };
  const document = file && documents.get(file.fileName);
  let line = position.line + 1;
  let column = position.character + 1;
  let length = diagnostic.length ?? 1;
  if (document) {
    line = document.lineMap[position.line] || 1;
    const original = document.source.split(/\r?\n/)[line - 1] ?? '';
    const token = file.text.slice(diagnostic.start, diagnostic.start + length);
    const generatedLine = file.text.split('\n')[position.line] ?? '';
    const occurrence = token ? generatedLine.slice(0, position.character).split(token).length - 1 : 0;
    let found = -1;
    for (let i = 0; i <= occurrence; i++) {
      const next = original.indexOf(token, found + 1);
      if (next < 0) break;
      found = next;
    }
    column = found >= 0 ? found + 1 : original.length - original.trimStart().length + 1;
    length = Math.max(1, Math.min(length, original.length - column + 1));
  }
  const detail = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  return {
    filePath: document?.filePath ?? file?.fileName ?? 'input.hgs', line, column, length,
    code: diagnostic.code, message: hints[diagnostic.code] ? `${hints[diagnostic.code]}\n${detail}` : detail,
    severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning'
  };
}

export function formatSourceDiagnostics(diagnostics) {
  return diagnostics.map(d => `${d.filePath}:${d.line}:${d.column} [${typeof d.code === 'number' ? 'TS' : ''}${d.code}] ${d.message}`).join('\n');
}
