#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("..");

const STDIN_FILE_NO = 0;

const usage = () => `\
Parse PGN files to JSON.

USAGE:
  pgn-parser [options] [--] [FILE]...

OPTIONS:
  -h, --help       Show help
  -p, --pretty     Output formatted json

ARGS:
  <FILE>...     PGN file(s) to parse as JSON. Use '-' for stdin.
                If no FILE is provided it reads from stdin`;

const processArguments = (process) => {
  const args = process.argv.slice(2);
  const files = [];
  const options = { help: false, pretty: false };
  let onlyFiles = false

  for (const arg of args) {
    if (arg.startsWith('-') && !onlyFiles) {
      switch (arg) {
        case '-h':
        case '--help':
          options.help = true;
          break;

        case '-p':
        case '--pretty':
          options.pretty = true;
          break;

        case '-':
          files.push(STDIN_FILE_NO);
          break;

        case '--':
          onlyFiles = true
          break

        default:
          throw Error(`Unknown option ${arg}`);
      }
    } else {
      files.push(arg)
      onlyFiles = true
    }
  }

  if (files.length === 0) {
    files.push(STDIN_FILE_NO);
  }

  return { files, options }
};

const filesToJson = (files) => {
  const games = [];

  for (const file of files) {
    const fileContent = fs
      .readFileSync(file === STDIN_FILE_NO ? file : path.resolve(file))
      .toString()
      .trim();

    if (fileContent) {
      const gamesOnFile = parse(fileContent, { startRule: "games" });

      games.push(...gamesOnFile);
    }
  }

  return games;
};

const main = (process) => {
  let arguments

  try {
    arguments = processArguments(process);
  } catch(e) {
    console.error(e.message)
    console.log(usage())
    process.exit(1)
    return
  }

  const { files, options: { help, pretty } } = arguments

  if (help) {
    console.log(usage())
    process.exit(0)
    return
  }

  const gamesParsed = filesToJson(files);

  const gamesJson = JSON.stringify(gamesParsed, null, pretty ? 2 : undefined)

  console.log(gamesJson)
};

main(process);
