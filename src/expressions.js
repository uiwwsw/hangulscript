import ts from 'typescript';

const literals = new Map([['참', 'true'], ['거짓', 'false'], ['비어있음', 'null'], ['정의안됨', 'undefined'], ['자신', 'this'], ['부모', 'super']]);
const types = new Map([['숫자', 'number'], ['문자열', 'string'], ['논리', 'boolean'], ['불리언', 'boolean'], ['아무거나', 'any'], ['모름', 'unknown'], ['무효', 'void'], ['목록', 'Array'], ['집합', 'Set'], ['사전', 'Map']]);

function identifiers(source, replacements) {
  const file = ts.createSourceFile('expression.ts', source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const visit = node => {
    if (ts.isIdentifier(node) && replacements.has(node.text)) {
      const p = node.parent;
      const property = (ts.isPropertyAccessExpression(p) && p.name === node) ||
        ((ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p) || ts.isPropertySignature(p)) && p.name === node);
      if (!property) edits.push([node.getStart(file), node.end, replacements.get(node.text)]);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  for (const [start, end, value] of edits.reverse()) source = source.slice(0, start) + value + source.slice(end);
  return source;
}

export function expression(source) {
  let phrase;
  if ((phrase = source.trim().match(/^(.+?)(?:을|를) (오름차순|내림차순)으로 정렬한 값$/u))) return phrase[2] + '(' + expression(phrase[1]) + ')';
  if ((phrase = source.trim().match(/^(.+?)(?:을|를) (얕게|깊게) 복사한 값$/u))) return (phrase[2] === '얕게' ? '얕게복사' : '깊게복사') + '(' + expression(phrase[1]) + ')';
  if ((phrase = source.trim().match(/^(.+?)에서 중복을 제거한 값$/u))) return '중복제거(' + expression(phrase[1]) + ')';
  source = source.replace(/^새\s+/, 'new ').replace(/^기다리기\s+/, 'await ');
  if (/[참거비정자부]/.test(source)) {
    const prefix = 'const __expression = (';
    source = identifiers(prefix + source + ');', literals).slice(prefix.length, -2);
  }
  return source;
}

export function typeExpression(source) {
  const prefix = 'type __Type = ';
  return identifiers(prefix + source, types).slice(prefix.length);
}

export function signature(source, name = '__fn') {
  const file = ts.createSourceFile('signature.ts', `function ${name}${source} {}`, ts.ScriptTarget.Latest, true);
  const fn = file.statements[0];
  if (file.parseDiagnostics.length || !ts.isFunctionDeclaration(fn)) throw new SyntaxError('함수 이름·매개변수·타입을 확인하세요.');
  return fn.parameters.map(param => {
    let printed = param.getText(file);
    const start = param.getStart(file);
    const edits = [];
    if (param.type) edits.push([param.type.getStart(file) - start, param.type.end - start, typeExpression(param.type.getText(file))]);
    if (param.initializer) edits.push([param.initializer.getStart(file) - start, param.initializer.end - start, expression(param.initializer.getText(file))]);
    for (const [from, to, value] of edits.sort((a, b) => b[0] - a[0])) printed = printed.slice(0, from) + value + printed.slice(to);
    if (!param.type && !param.initializer) printed += param.dotDotDotToken ? ': any[]' : ': any';
    return printed;
  }).join(', ');
}

export function statement(source) {
  const file = ts.createSourceFile('statement.ts', source, ts.ScriptTarget.Latest, true);
  if (file.parseDiagnostics.length || file.statements.length !== 1 || !ts.isExpressionStatement(file.statements[0])) {
    throw new SyntaxError('문장형 구문을 사용하세요. 선언은 「이름은 값이다」, 함수는 「이름(...)를 정의한다:」로 작성합니다.');
  }
  return source.replace(/;$/, '') + ';';
}
