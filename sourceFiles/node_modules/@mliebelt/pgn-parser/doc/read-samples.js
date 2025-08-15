const fs = require('fs/promises')
const path = require('path')
// This shows which part of the library is used. Make clear that the main entry of `packages.json` is used.
const parse = require('../lib/index.umd').parse
const split = require('../lib/index.umd').split
// helpers
const parseGames = (string) => parse(string, {startRule: 'games'})
const splitGames = (string) => split(string, {startRule: "games"})

const gamesFilePath = path.resolve(__dirname, './sampleGames.pgn')
fs.readFile(gamesFilePath, 'utf-8')
    .then(pgnFile=> {
        const games = splitGames(pgnFile)
        const players = []
        games.forEach((game) => {
            const tags = parse(game.tags, {startRule: 'tags'}).tags
            players.push(tags.White)
            players.push(tags.Black)
        })
        console.log('Games: ', JSON.stringify(games, null, 2))
        console.log('Players: ', JSON.stringify(players, null, 2))
    })
    .catch(console.error)