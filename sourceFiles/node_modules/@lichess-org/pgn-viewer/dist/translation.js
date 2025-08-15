export default function translate(translator) {
    return (key) => (translator && translator(key)) || defaultTranslator(key);
}
const defaultTranslator = (key) => defaultTranslations[key];
const defaultTranslations = {
    flipTheBoard: 'Flip the board',
    analysisBoard: 'Analysis board',
    practiceWithComputer: 'Practice with computer',
    getPgn: 'Get PGN',
    download: 'Download',
    viewOnLichess: 'View on Lichess',
    viewOnSite: 'View on site',
};
//# sourceMappingURL=translation.js.map