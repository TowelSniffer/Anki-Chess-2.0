const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');
const mediaDir = path.join(__dirname, 'media');

// Clean dist directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Run esbuild
esbuild.build({
    entryPoints: [path.join(srcDir, 'src/main.js')],
    bundle: true,
    outfile: path.join(distDir, '_chess3.0.js'),
    assetNames: '[name]',
    loader: {
        '.css': 'css',
        '.woff2': 'file',
        '.svg': 'file'
    },
}).then(() => {
    // Copy and modify index.html
    const htmlPath = path.join(distDir, '_chess3.0.html');
    let htmlContent = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
    htmlContent = htmlContent.replace('dist/bundle.css', '_chess3.0.css');
    htmlContent = htmlContent.replace('dist/bundle.js', '_chess3.0.js');
    fs.writeFileSync(htmlPath, htmlContent);

    // Copy media files
    fs.readdirSync(mediaDir).forEach(file => {
        fs.copyFileSync(path.join(mediaDir, file), path.join(distDir, file));
    });

    console.log('Build finished successfully.');
}).catch((e) => {
    console.error(e);
    process.exit(1);
});