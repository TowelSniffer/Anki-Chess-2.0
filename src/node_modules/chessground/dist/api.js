import * as board from './board.js';
import { write as fenWrite } from './fen.js';
import { configure, applyAnimation } from './config.js';
import { anim, render } from './anim.js';
import { cancel as dragCancel, dragNewPiece } from './drag.js';
import { explosion } from './explosion.js';
// see API types and documentations in dts/api.d.ts
export function start(state, redrawAll) {
    function toggleOrientation() {
        board.toggleOrientation(state);
        redrawAll();
    }
    return {
        set(config) {
            if (config.orientation && config.orientation !== state.orientation)
                toggleOrientation();
            applyAnimation(state, config);
            (config.fen ? anim : render)(state => configure(state, config), state);
        },
        state,
        getFen: () => fenWrite(state.pieces),
        toggleOrientation,
        setPieces(pieces) {
            anim(state => board.setPieces(state, pieces), state);
        },
        selectSquare(key, force) {
            if (key)
                anim(state => board.selectSquare(state, key, force), state);
            else if (state.selected) {
                board.unselect(state);
                state.dom.redraw();
            }
        },
        move(orig, dest) {
            anim(state => board.baseMove(state, orig, dest), state);
        },
        newPiece(piece, key) {
            anim(state => board.baseNewPiece(state, piece, key), state);
        },
        playPremove() {
            if (state.premovable.current) {
                if (anim(board.playPremove, state))
                    return true;
                // if the premove couldn't be played, redraw to clear it up
                state.dom.redraw();
            }
            return false;
        },
        playPredrop(validate) {
            if (state.predroppable.current) {
                const result = board.playPredrop(state, validate);
                state.dom.redraw();
                return result;
            }
            return false;
        },
        cancelPremove() {
            render(board.unsetPremove, state);
        },
        cancelPredrop() {
            render(board.unsetPredrop, state);
        },
        cancelMove() {
            render(state => {
                board.cancelMove(state);
                dragCancel(state);
            }, state);
        },
        stop() {
            render(state => {
                board.stop(state);
                dragCancel(state);
            }, state);
        },
        explode(keys) {
            explosion(state, keys);
        },
        setAutoShapes(shapes) {
            render(state => (state.drawable.autoShapes = shapes), state);
        },
        setShapes(shapes) {
            render(state => (state.drawable.shapes = shapes), state);
        },
        getKeyAtDomPos(pos) {
            return board.getKeyAtDomPos(pos, board.whitePov(state), state.dom.bounds());
        },
        redrawAll,
        dragNewPiece(piece, event, force) {
            dragNewPiece(state, piece, event, force);
        },
        destroy() {
            board.stop(state);
            state.dom.unbind && state.dom.unbind();
            state.dom.destroyed = true;
        },
    };
}
//# sourceMappingURL=api.js.map