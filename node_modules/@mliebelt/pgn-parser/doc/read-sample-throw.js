const fs = require('fs/promises')
const path = require('path')
// This shows which part of the library is used. Make clear that the main entry of `packages.json` is used.
const parse = require('../lib/index.umd').parse
// helpers
const parseGames = (string) => parse(string, {startRule: 'games'})

// assuming source directory is sibling of node_modules
const gameFilePath = path.resolve(__dirname, './sampleGameThrow.pgn')
fs.readFile(gameFilePath, 'utf-8')
    .then(pgnFile=> {
        const game = parseGames(pgnFile).pop()
        console.log('game.moves[0] = ', game.moves[0])
    })
    .catch(console.error)