import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export function sourceGraph() {
  const root = process.cwd();
  const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
  const relative = (file) => path.relative(root, path.resolve(file)).split(path.sep).join('/');
  const files = new Map();
  const assets = new Set();
  const missing = [];
  const edges = [];
  function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(file) : [relative(file)];
    });
  }
  for (const file of [...walk('src').filter((f) => /\.tsx?$/.test(f)), 'App.tsx', 'index.ts']) {
    const source = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const dependencies = [];
    const add = (specifier, typeOnly = false) => {
      if (!specifier.startsWith('.')) return;
      const resolved = ts.resolveModuleName(
        specifier,
        path.resolve(file),
        options,
        ts.sys,
      ).resolvedModule;
      if (resolved) {
        const target = relative(resolved.resolvedFileName);
        dependencies.push(target);
        edges.push({ from: file, to: target, typeOnly });
      } else {
        const target = relative(path.join(path.dirname(file), specifier));
        if (!fs.existsSync(target)) missing.push({ from: file, to: target });
        else if (target.startsWith('assets/')) assets.add(target);
      }
    };
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const named = clause?.namedBindings;
        const typeOnly = Boolean(
          clause?.isTypeOnly ||
          (!clause?.name &&
            named &&
            ts.isNamedImports(named) &&
            named.elements.every((e) => e.isTypeOnly)),
        );
        add(node.moduleSpecifier.text, typeOnly);
      }
      if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        add(node.moduleSpecifier.text, node.isTypeOnly);
      if (
        ts.isCallExpression(node) &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0]) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
      )
        add(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    files.set(file, { source, dependencies, lines: source.split('\n').length });
  }
  function appAssets(value) {
    if (typeof value === 'string' && value.startsWith('./assets/')) {
      const file = relative(value);
      if (fs.existsSync(file)) assets.add(file);
      else missing.push({ from: 'app.json', to: file });
    } else if (Array.isArray(value)) value.forEach(appAssets);
    else if (value && typeof value === 'object') Object.values(value).forEach(appAssets);
  }
  appAssets(JSON.parse(fs.readFileSync('app.json', 'utf8')));
  return { files, assets, edges, missing, assetFiles: walk('assets') };
}
