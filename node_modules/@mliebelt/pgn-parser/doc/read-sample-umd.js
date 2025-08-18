const fs = require('fs/promises')
const path = require('path')
// This is the variant where the UMD version of the library is used. That version works in both node.js and the browser!
const parse = require('../lib/index.umd').parse
// helpers
const parseGames = (string) => parse(string, {startRule: 'games'})

// assuming source directory is sibling of node_modules
const gameFilePath = path.resolve(__dirname, './sampleGame.pgn')
fs.readFile(gameFilePath, 'utf-8')
    .then(pgnFile=> {
        const game = parseGames(pgnFile).pop()
        console.log('game.moves[0] = ', game.moves[0])
    })
    .catch(console.error)