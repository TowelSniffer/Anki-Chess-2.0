import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const sfFull = pkg.dependencies.stockfish.replace(/[^0-9.]/g, ''); // Gets "18.0.5"
const sfMajor = sfFull.split('.')[0]; // Gets "18"

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// --- CLEANUP LOGIC ---
// Remove any existing stockfish files that don't match the current version
const currentFiles = [
    `_stockfish-${sfFull}-lite-single.js`,
    `_stockfish-${sfFull}-lite-single.wasm`
];

fs.readdirSync(publicDir).forEach(file => {
    if (file.startsWith('_stockfish') && !currentFiles.includes(file)) {
        console.log(`Cleaning up old Stockfish file: ${file}`);
        fs.unlinkSync(path.join(publicDir, file));
    }
});

// --- COPY LOGIC ---
const srcJs = path.resolve(`node_modules/stockfish/bin/stockfish-${sfMajor}-lite-single.js`);
const srcWasm = path.resolve(`node_modules/stockfish/bin/stockfish-${sfMajor}-lite-single.wasm`);

const destJs = path.resolve(publicDir, currentFiles[0]);
const destWasm = path.resolve(publicDir, currentFiles[1]);

fs.copyFileSync(srcJs, destJs);
fs.copyFileSync(srcWasm, destWasm);

console.log(`Successfully deployed Stockfish ${sfFull} to public/`);
