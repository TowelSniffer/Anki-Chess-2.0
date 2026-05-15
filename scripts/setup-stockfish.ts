import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const sfFull = pkg.dependencies.stockfish.replace(/[^0-9.]/g, '');
const sfMajor = sfFull.split('.')[0];

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// --- CLEANUP LOGIC ---
const jsFileName = `_stockfish-${sfFull}-asm.js`;

fs.readdirSync(publicDir).forEach(file => {
    if (file.startsWith('_stockfish') && file !== jsFileName) {
        console.log(`Cleaning up old Stockfish file: ${file}`);
        fs.unlinkSync(path.join(publicDir, file));
    }
});

// --- BASE64 WASM INJECTION ---
const srcJs = path.resolve(`node_modules/stockfish/bin/stockfish-${sfMajor}-asm.js`);
const destJs = path.resolve(publicDir, jsFileName);

console.log('Deploying pure JS (ASM) Stockfish to bypass CSP...');
fs.copyFileSync(srcJs, destJs);
console.log(`Successfully deployed ${jsFileName} to public/`);
