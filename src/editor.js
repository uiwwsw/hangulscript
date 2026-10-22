import ts from 'typescript';
import path from 'node:path';
import { analyzeSource } from './checker.js';
import { mapDiagnostic } from './diagnostics.js';

/** One-based source positions; analysis only, never executes user code. */
export function inspectSource(source, filePath, line, column, settings = {}) {
  const analysis = analyzeSource(source, filePath, settings);
  const file = analysis.program.getSourceFile(analysis.virtualRoot);
  const document = analysis.documents.get(analysis.virtualRoot);
  if (!file || !document) return { completions: [], definitions: [] };
  let target = file;
  let matched;
  const original = source.split(/\r?\n/)[line - 1] ?? '';
  const visit = node => {
    if (ts.isIdentifier(node)) {
      const pos = file.getLineAndCharacterOfPosition(node.getStart(file));
      if (document.lineMap[pos.line] === line) {
        target = node;
        const generatedLine = file.text.split('\n')[pos.line];
        const occurrence = generatedLine.slice(0, pos.character).split(node.text).length - 1;
        let found = -1;
        for (let i=0; i<=occurrence; i++) { const next=original.indexOf(node.text,found+1); if(next<0) break; found=next; }
        if (found >= 0 && column - 1 >= found && column - 1 <= found + node.text.length) matched = node;
      }
    }
    ts.forEachChild(node,visit);
  };
  visit(file);
  const checker = analysis.program.getTypeChecker();
  target = matched ?? target;
  const completions = checker.getSymbolsInScope(target, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Alias)
    .filter(symbol => symbol.declarations?.some(d => analysis.documents.has(d.getSourceFile().fileName) && !['화면연결', '정렬비교'].includes(symbol.name)))
    .map(symbol => ({ name: symbol.name, detail: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol,target)) }));
  if (!matched) return { completions, definitions: [] };
  let symbol = checker.getSymbolAtLocation(matched);
  if (!symbol) return { completions, definitions: [] };
  if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  const type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol,matched),matched,ts.TypeFormatFlags.NoTruncation);
  const definitions = (symbol.declarations ?? []).flatMap(declaration => {
    const name = declaration.name ?? declaration;
    const sourceFile=name.getSourceFile();
    const doc=analysis.documents.get(sourceFile.fileName);
    const position=sourceFile.getLineAndCharacterOfPosition(name.getStart(sourceFile));
    if (!doc || !doc.lineMap[position.line]) return [];
    const location=mapDiagnostic({file:sourceFile,start:name.getStart(sourceFile),length:name.getWidth(sourceFile),code:0,messageText:'',category:ts.DiagnosticCategory.Message},analysis.documents);
    return [{filePath:path.resolve(location.filePath),line:location.line,column:location.column,length:location.length}];
  });
  return { hover: `${symbol.name}: ${type}`, completions, definitions };
}
