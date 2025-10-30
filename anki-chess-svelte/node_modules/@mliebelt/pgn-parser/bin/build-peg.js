const peg = require('peggy')
const fs = require('fs')

// node_modules/peggy/bin/peggy --allowed-start-rules pgn,tags,game,games -o _pgn-parser.js src/pgn-rules.pegjs
const main = async () => {
    const options = {allowedStartRules: ['pgn', 'tags', 'game', 'games'], output: 'source', format: 'umd'}
    const pgnParser = peg.generate(await fs.readFileSync('./src/pgn-rules.pegjs', 'utf-8'), options)
    const pgnParserPatched = '// @ts-nocheck\n' + pgnParser
    await fs.writeFileSync('./src/_pgn-parser.js', pgnParserPatched)
}
main()