// Grab all matching SVGs eagerly as raw strings
const pieceModules = import.meta.glob('$assets/pieces/_*.svg', {
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

// Transform the file paths into your keys (e.g., './_wP.svg' -> 'wP')
export const pieceImages = Object.entries(pieceModules).reduce(
  (acc, [path, content]) => {
    const key = path.split('_')[1].split('.')[0];
    acc[key] = toDataUri(content);
    return acc;
  },
  {} as Record<string, string>,
);

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
