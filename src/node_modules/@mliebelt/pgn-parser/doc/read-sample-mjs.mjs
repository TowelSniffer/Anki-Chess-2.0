import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// This shows which part of the library is used. Make clear that the main entry of `packages.json` is used.
import { parse } from '../lib/index.umd.js'

// helpers
const parseGames = (string) => parse(string, {startRule: 'games'})

let fname = resolve(__dirname, './sampleGame.pgn')
let content = readFileSync(fname, { encoding: 'utf-8'})
const game = parseGames(content).pop()
console.log('game.moves[0] = ', game.moves[0])
