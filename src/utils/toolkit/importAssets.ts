// Grab all matching SVGs eagerly as raw strings
const pieceModules = import.meta.glob('$assets/pieces/*/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const nagModules = import.meta.glob('$assets/nags/_*.webp', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const soundModules = import.meta.glob('$assets/audio/_*.mp3', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const mdModules = import.meta.glob('$assets/docs/_*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const toDataUri = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

export const mdDocs = Object.entries(mdModules).reduce((acc, [path, content]) => {
  const key = path.split('_')[1].split('.')[0];
  acc[key] = content;
  return acc;
}, {} as Record<string, string>);

// Restructure piece svg's to group by theme
export const pieceThemes: Record<string, Record<string, string>> = {};

Object.entries(pieceModules).forEach(([path, content]) => {
  // path example: /src/assets/pieces/cburnett/wN.svg
  const parts = path.split('/');
  const fileName = parts.pop()!;
  const themeName = parts.pop()!;
  const pieceKey = fileName.split('.')[0];

  if (!pieceThemes[themeName]) pieceThemes[themeName] = {};
  pieceThemes[themeName][pieceKey] = toDataUri(content);
});

export const availablePieceThemes = Object.keys(pieceThemes);

export const nagImages = Object.entries(nagModules).reduce((acc, [path, url]) => {
  const key = path.split('_')[1].split('.')[0];
  acc[key] = url;
  return acc;
}, {} as Record<string, string>);

export const soundAssets = Object.entries(soundModules).reduce((acc, [path, url]) => {
  const key = path.split('_')[1].split('.')[0];
  acc[key] = url;
  return acc;
}, {} as Record<string, string>);
