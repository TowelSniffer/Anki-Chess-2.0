import frontTemplate from '$anki/front.html?raw';
import cssTemplate from '$anki/style.css?raw';
import defaultConfig from '$anki/default_config.json';

export async function updateAnkiChessTemplate(
  modelName: string,
  cardName: string,
  userConfig: object,
  version: string | number | null = null
) {
  const url = 'http://127.0.0.1:8765';
  const cacheVer = version ? `.${version}` : '';

  // merge userConfig with defaults to ensure no keys are missing
  const finalConfig = { ...defaultConfig, ...userConfig };

  const configString = `window.USER_CONFIG = ${JSON.stringify(finalConfig, null, 2)};`;

  // 1. Construct the new Front Template with inlined Config and Cache-busted Script
  // Note: We use JSON.stringify to safely embed the config object
  let newFront = frontTemplate
    .replace('// __USER_CONFIG__', configString)
    .replaceAll('__VERSION__', cacheVer);
  const newBack = newFront.replace('data-boardMode="Puzzle"', 'data-boardMode="Viewer"');

  // 2. Construct the new CSS with Cache-busted Import
  const newCss = cssTemplate.replaceAll('__VERSION__', cacheVer);

  try {
    // Step A: Fetch current model to preserve the Back template
    // We don't want to accidentally wipe the Back of the card.
    const modelQuery = await fetch(url, {
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
    const res = await fetch(url, {
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
    console.log(`Updated Template for "${modelName}" (v=${version})`);

  } catch (err) {
    console.error('AnkiConnect Template Update Failed:', err);
  }
}
