const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
    entryPoints: [path.join(__dirname, 'src/main.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'dist/bundle.js'),
    loader: { '.css': 'css' },
    // esbuild will automatically create dist/bundle.css for the imported CSS files.
}).catch((e) => {
    console.error(e);
    process.exit(1);
});

console.log('Build finished successfully.');