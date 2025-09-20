const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const { globSync } = require('glob');

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');
const mediaDir = path.join(__dirname, 'media');
const sourceGlob = 'node_modules/stockfish/src/stockfish-17.1-single-a496a04*';
const renameFrom = 'stockfish-17.1-single-a496a04';
const renameTo = '_stockfish';

// Check for dev/watch mode
const isDev = process.argv.includes('--dev');

// Function for all post-build file operations
function postBuildTasks() {
    // Copy and modify index.html
    const htmlPath = path.join(distDir, '_chess3.0.html');
    let htmlContent = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
    htmlContent = htmlContent.replace('<link rel="stylesheet" href="dist/bundle.css">', '<link rel="stylesheet" href="_chess3.0.css">');
    htmlContent = htmlContent.replace('<script src="dist/bundle.js"></script>', '<script src="_chess3.0.js"></script>');
    fs.writeFileSync(htmlPath, htmlContent);
    // Copy media files
    fs.readdirSync(mediaDir).forEach(file => {
        fs.copyFileSync(path.join(mediaDir, file), path.join(distDir, file));
    });
    const files = globSync(sourceGlob);
    files.forEach(sourcePath => {
        const originalFilename = path.basename(sourcePath);

        // 3. Create the new filename by replacing the version string
        const newFilename = originalFilename.replace(renameFrom, renameTo);

        const destPath = path.join(distDir, newFilename);

        fs.copyFileSync(sourcePath, destPath);
    });

console.log(`${isDev ? new Date().toLocaleTimeString() + ':' : ''} Build finished successfully.`);
}

// Clean dist directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

(async () => {
    const buildOptions = {
        entryPoints: [path.join(srcDir, 'src/main.ts')],
        bundle: true,
        outfile: path.join(distDir, '_chess3.0.js'),
        assetNames: '[name]',
        loader: {
            '.css': 'css',
            '.woff2': 'file',
            '.svg': 'file'
        },
        external: ['stockfish'],
    };

    try {
        if (isDev) {
            // Use the context API for watch mode
            const context = await esbuild.context({
                ...buildOptions,
                plugins: [{
                    name: 'post-build-plugin',
                    setup(build) {
                        build.onEnd(result => {
                            if (result.errors.length > 0) {
                                console.log(`Build failed with ${result.errors.length} errors.`);
                            } else {
                                postBuildTasks();
                            }
                        });
                    }
                }]
            });
            await context.watch();
            console.log('Watching for changes...');
        } else {
            // Standard build for production
            await esbuild.build(buildOptions);
            postBuildTasks();
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
