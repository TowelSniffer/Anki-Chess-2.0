import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const sfFull = pkg.dependencies.stockfish.replace(/[^0-9.]/g, ''); // Gets "18.0.5"
const sfMajor = sfFull.split('.')[0]; // Gets "18"

const srcJs = path.resolve(`node_modules/stockfish/bin/stockfish-${sfMajor}-single.js`);
const srcWasm = path.resolve(`node_modules/stockfish/bin/stockfish-${sfMajor}-single.wasm`);

// Target the full version for caching
const destJs = path.resolve(`public/_stockfish-${sfFull}-single.js`);
const destWasm = path.resolve(`public/_stockfish-${sfFull}-single.wasm`);

if (!fs.existsSync('public')) fs.mkdirSync('public');

fs.copyFileSync(srcJs, destJs);
fs.copyFileSync(srcWasm, destWasm);
