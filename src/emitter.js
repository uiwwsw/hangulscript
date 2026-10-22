import ts from 'typescript';
import path from 'node:path';
import { analyzeSource } from './checker.js';
import { HangulScriptError, mapDiagnostic } from './diagnostics.js';

// Keep JavaScript and declaration imports consistent with emitted filenames.
function rewriteImports(context) {
  const visit = node => {
    if (ts.isStringLiteral(node) && node.parent && node.text.endsWith('.hgs') &&
      ((ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent)) && node.parent.moduleSpecifier === node ||
       ts.isCallExpression(node.parent) && node.parent.expression.kind === ts.SyntaxKind.ImportKeyword && node.parent.arguments[0] === node)) {
      return context.factory.createStringLiteral(node.text.replace(/\.hgs$/, '.js'));
    }
    // afterDeclarations nodes do not always carry parent links.
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.endsWith('.hgs')) {
      return context.factory.updateImportDeclaration(node, node.modifiers, node.importClause, context.factory.createStringLiteral(node.moduleSpecifier.text.replace(/\.hgs$/, '.js')), node.attributes);
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.endsWith('.hgs')) {
      return context.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, context.factory.createStringLiteral(node.moduleSpecifier.text.replace(/\.hgs$/, '.js')), node.attributes);
    }
    return ts.visitEachChild(node, visit, context);
  };
  return node => ts.visitNode(node, visit);
}

export function emitSource(source, filePath) {
  const result = analyzeSource(source, filePath);
  if (result.hasErrors) throw new HangulScriptError(result.diagnostics);
  const files = new Map();
  const emitted = result.program.emit(undefined, (name, content) => files.set(name, content), undefined, undefined, { before: [rewriteImports], afterDeclarations: [rewriteImports] });
  if (emitted.emitSkipped) throw new HangulScriptError(emitted.diagnostics.map(d => mapDiagnostic(d, result.documents)));
  const modules = [...result.documents].map(([virtual, doc]) => ({
    sourcePath: doc.filePath,
    javascript: files.get(virtual.replace(/\.ts$/, '.js')) ?? '',
    declaration: files.get(virtual.replace(/\.ts$/, '.d.ts')) ?? ''
  }));
  const root = modules.find(module => module.sourcePath === path.resolve(filePath));
  return { javascript: root.javascript, declaration: root.declaration, modules };
}
