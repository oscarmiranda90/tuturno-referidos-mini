import fs from 'node:fs';
import { sourceGraph } from './source-graph.mjs';

const graph = sourceGraph();
const problems = graph.missing.map(({ from, to }) => `${from}: unresolved local dependency ${to}`);
const roots = [
  'index.ts',
  'src/features/club/index.tsx',
  ...[...graph.files.keys()].filter((file) => file.endsWith('.spec.ts')),
];
const reachable = new Set();
function follow(file) {
  if (reachable.has(file)) return;
  reachable.add(file);
  graph.files.get(file)?.dependencies.forEach(follow);
}
roots.forEach(follow);

for (const directory of [
  'screens',
  'components',
  'domain',
  'referrals',
  'services',
  'club',
  'theme',
]) {
  if (fs.existsSync(`src/${directory}`))
    problems.push(`src/${directory}: use the app, features, shared or demo owner`);
}
for (const [file, { lines }] of graph.files) {
  if (!reachable.has(file))
    problems.push(`${file}: no application, test or documented public entry reaches this module`);
  if (/V\d+\.(ts|tsx)$/.test(file))
    problems.push(`${file}: keep one canonical implementation instead of versioned screens`);
  if (lines > 1000) problems.push(`${file}: ${lines} lines; separate its responsibilities`);
}
for (const file of graph.assetFiles) {
  if (!graph.assets.has(file))
    problems.push(`${file}: no source or app configuration references this asset`);
}
for (const edge of graph.edges) {
  if (edge.typeOnly || edge.from.endsWith('.spec.ts')) continue;
  if (edge.from.startsWith('src/shared/') && !edge.to.startsWith('src/shared/'))
    problems.push(`${edge.from}: shared runtime code depends on ${edge.to}`);
  if (edge.from.startsWith('src/features/') && edge.to.startsWith('src/app/'))
    problems.push(`${edge.from}: feature runtime code depends on app navigation ${edge.to}`);
  if (
    edge.from.startsWith('src/features/') &&
    edge.to.startsWith('src/demo/') &&
    !['src/demo/config.ts', 'src/demo/ClubDevPicker.tsx'].includes(edge.to)
  )
    problems.push(`${edge.from}: feature UI imports demo implementation ${edge.to}`);
}

const runtime = new Map();
for (const edge of graph.edges.filter((edge) => !edge.typeOnly && !edge.from.endsWith('.spec.ts')))
  runtime.set(edge.from, [...(runtime.get(edge.from) ?? []), edge.to]);
const active = new Set();
const visited = new Set();
function cycles(file, chain = []) {
  if (active.has(file)) {
    problems.push(`Runtime import cycle: ${[...chain, file].join(' -> ')}`);
    return;
  }
  if (visited.has(file)) return;
  active.add(file);
  for (const dependency of runtime.get(file) ?? []) cycles(dependency, [...chain, file]);
  active.delete(file);
  visited.add(file);
}
for (const file of graph.files.keys()) cycles(file);

if (problems.length) {
  console.error(
    `✗ Structure: ${problems.length} problem(s)\n${problems.map((problem) => `  ${problem}`).join('\n')}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `✓ Structure: ${graph.files.size} modules, ${graph.assets.size} referenced assets, no orphan files or runtime cycles`,
  );
}
