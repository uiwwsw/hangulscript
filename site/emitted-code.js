import ts from 'typescript';
import { sentenceRuntime } from '../src/runtime.js';

// Show the same complete program that the sandbox executes, retaining only
// referenced standard functions and their transitive dependencies.
export function emittedCode(compiled) {
  if (!compiled.startsWith(sentenceRuntime)) throw new Error('표준 함수 경계를 확인할 수 없습니다.');
  const file = ts.createSourceFile('main.ts', compiled, ts.ScriptTarget.ES2022, true);
  const host = {
    getSourceFile: name => name === 'main.ts' ? file : undefined,
    getDefaultLibFileName: () => '', getCurrentDirectory: () => '',
    getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n', fileExists: name => name === 'main.ts',
    readFile: name => name === 'main.ts' ? compiled : undefined, writeFile() {}
  };
  const program = ts.createProgram(['main.ts'], { noLib: true, noResolve: true }, host);
  const checker = program.getTypeChecker();
  const runtime = file.statements.filter(node => node.end <= sentenceRuntime.length);
  const user = file.statements.filter(node => node.end > sentenceRuntime.length);
  const definitions = new Map();
  for (const node of runtime) {
    if (!ts.isFunctionDeclaration(node) || !node.name) throw new Error('지원하지 않는 표준 함수 선언입니다.');
    const symbol = checker.getSymbolAtLocation(node.name);
    definitions.set(symbol, [...(definitions.get(symbol) ?? []), node]);
  }
  const print = runtime.find(node => node.name.text === '출력');
  const printSymbol = checker.getSymbolAtLocation(print.name);
  const transformed = ts.transform(user, [context => root => {
    const visit = node => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)
          && checker.getSymbolAtLocation(node.expression) === printSymbol
          && !checker.getSymbolsInScope(node, ts.SymbolFlags.Value).some(symbol => symbol.name === 'console')) {
        return context.factory.updateCallExpression(node,
          context.factory.createPropertyAccessExpression(context.factory.createIdentifier('console'), 'log'),
          node.typeArguments, node.arguments.map(arg => ts.visitNode(arg, visit)));
      }
      return ts.visitEachChild(node, visit, context);
    };
    return ts.visitNode(root, visit);
  }]);
  try {
    const needed = new Set();
    function references(node) {
      if (ts.isIdentifier(node) && node.pos >= 0) {
        const symbol = node.parent && ts.isShorthandPropertyAssignment(node.parent)
          ? checker.getShorthandAssignmentValueSymbol(node.parent) : checker.getSymbolAtLocation(node);
        if (definitions.has(symbol) && !needed.has(symbol)) {
          needed.add(symbol);
          for (const declaration of definitions.get(symbol)) references(declaration);
        }
      }
      ts.forEachChild(node, references);
    }
    transformed.transformed.forEach(references);
    const statements = [...runtime.filter(node => needed.has(checker.getSymbolAtLocation(node.name))), ...transformed.transformed];
    const display = ts.createPrinter().printFile(ts.factory.updateSourceFile(file, statements));
    const javascript = ts.transpileModule(display, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }
    }).outputText;
    return { display, displayJavascript: javascript, javascript };
  } finally { transformed.dispose(); }
}
