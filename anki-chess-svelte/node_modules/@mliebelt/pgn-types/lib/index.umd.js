(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["pgn-types"] = {}));
})(this, (function (exports) { 'use strict';

    /* From pgn-writer */
    const PROMOTIONS = {
        'q': 'queen',
        'r': 'rook',
        'b': 'bishop',
        'n': 'knight'
    };
    const prom_short = ['q', 'r', 'b', 'n'];
    const colors = ['white', 'black'];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    exports.PROMOTIONS = PROMOTIONS;
    exports.colors = colors;
    exports.files = files;
    exports.prom_short = prom_short;
    exports.ranks = ranks;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
