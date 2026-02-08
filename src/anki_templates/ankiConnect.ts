import frontTemplate from '$anki/front.html?raw';
import cssTemplate from '$anki/style.css?raw';
import defaultConfig from '$anki/default_config.json';
import pkg from '../../package.json';

const ANKI_URL = 'http://127.0.0.1:8765';

export async function checkAnkiConnection(): Promise<boolean> {
  try {
    const res = await fetch(ANKI_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'version', version: 6 })
    });
    const data = await res.json();
    return !data.error;
  } catch (e) {
    return false;
  }
}

export async function updateAnkiChessTemplate(
  modelName: string,
  cardName: string,
  userConfig: object
) {
  const currentVersion = pkg.version;

  // merge userConfig with defaults to ensure no keys are missing
  const finalConfig = { ...defaultConfig, ...userConfig };

  const configString = `window.USER_CONFIG = ${JSON.stringify(finalConfig, null, 2)};`;

  // Construct the new Front Template with inlined Config and Cache-busted Script
  let newFront = frontTemplate
    .replace('// __USER_CONFIG__', configString)
    .replaceAll('__VERSION__', currentVersion);
  const newBack = newFront.replace('data-boardMode="Puzzle"', 'data-boardMode="Viewer"');

  // Construct the new CSS with Cache-busted Import
  const newCss = cssTemplate.replaceAll('__VERSION__', currentVersion);

  try {
    // Step A: Fetch current model to preserve the Back template
    // We don't want to accidentally wipe the Back of the card.
    const modelQuery = await fetch(ANKI_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'modelTemplates',
        version: 6,
        params: { modelName: modelName }
      })
    });
    const modelResult = await modelQuery.json();

    if (modelResult.error) throw new Error(`Fetch Model Failed: ${modelResult.error}`);

    // Step B: Push the Update
    const res = await fetch(ANKI_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateModelTemplates',
        version: 6,
        params: {
          model: {
            name: modelName,
            templates: {
              [cardName]: {
                Front: newFront,
                Back: newBack
              },
            },
            css: newCss,
          },
        },
      }),
    });

    const result = await res.json();
    if (result.error) throw new Error(result.error);
    console.log(`Updated Template for "${modelName}" (v=${currentVersion})`);

  } catch (err) {
    console.error('AnkiConnect Template Update Failed:', err);
  }
}
