<template>
  <div>
    <div id="overlay" class="hidden showHide"></div>
    <div id="container">
      <div id="commentBox">
        <div id="userTextContainer">
          <div id="textField"></div>
        </div>
        <div id="buttons-container">
          <button class="navBtn" id="resetBoard" disabled>
            <span class="material-icons">first_page</span>
          </button>
          <button class="navBtn" id="navBackward" disabled>
            <span class="material-icons">keyboard_arrow_left</span>
          </button>
          <button class="navBtn" id="navForward">
            <span class="material-icons">keyboard_arrow_right</span>
          </button>
          <button class="navBtn" title="Copy FEN to clipboard" id="copyFen">
            <span class="material-icons md-small">content_copy</span>
          </button>
          <button
            class="navBtn"
            title="Toggle Quick Analysis"
            id="stockfishToggle"
          >
            <span class="material-icons md-small">developer_board_off</span>
          </button>
          <button class="navBtn" id="rotateBoard">
            <span class="flipBoardIcon material-icons md-small">flip</span>
          </button>
        </div>
        <div id="pgnComment"></div>
      </div>
      <div id="board-container">
        <div id="board"></div>
      </div>
    </div>
    <div class="hidden showHide" id="promoteButtonsContainer">
      <button class="promoteBtn" value="q">
        <img class="promotePiece" id="promoteQ" />
      </button>
      <button class="promoteBtn" value="b">
        <img class="promotePiece" id="promoteB" />
      </button>
      <button class="promoteBtn" value="n">
        <img class="promotePiece" id="promoteN" />
      </button>
      <button class="promoteBtn" value="r">
        <img class="promotePiece" id="promoteR" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useChessStore } from './stores/chessStore';
import { eventEmitter } from './ts/core/stateProxy';
import { augmentPgnTree, initPgnViewer } from './ts/features/pgn/pgnViewer';
import { initializeUI, positionPromoteOverlay } from './ts/features/ui/initializeUI';
import { setupEventListeners } from './ts/features/ui/eventListeners';
import { loadChessgroundBoard } from './ts/features/board/chessFunctions';
import { changeCurrentPgnMove } from './ts/features/board/pgnPathChanged';
import { scorePuzzle } from './ts/features/board/puzzleScored';
import type { PgnMove } from '@mliebelt/pgn-types';
import { Chessground } from 'chessground'; // Import Chessground
import { state } from './ts/core/state'; // Import state
import { config } from './ts/core/config'; // Import config

// Import main SCSS
import './scss/main.scss';
import 'chessground/assets/chessground.base.css';


const chessStore = useChessStore();

onMounted(() => {
  // --- eventEmitters handle updates to board state ---
  eventEmitter.on("pgnPathChanged", (pgnPath, lastMove, pathMove) => {
    changeCurrentPgnMove(pgnPath, lastMove, pathMove);
  });

  eventEmitter.on("puzzleScored", (errorTrack) => {
    scorePuzzle(errorTrack);
  });

  // --- Chessground Initialization ---
  const cgwrap = document.getElementById("board") as HTMLDivElement;
  state.cgwrap = cgwrap; // Assign cgwrap to state
  state.cg = Chessground(cgwrap, {
    fen: state.parsedPGN.tags?.FEN ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Use state.parsedPGN.tags?.FEN or default
    premovable: {
      enabled: true,
    },
    movable: {
      free: false,
      showDests: config.showDests,
    },
    highlight: {
      check: true,
      lastMove: true,
    },
    animation: {
      enabled: false, // will manulally enable later to prevent position load animation
      duration: config.animationTime,
    },
    drawable: {
      enabled: true,
      brushes: {
        stockfish: {
          key: "stockfish",
          color: "#e5e5e5",
          opacity: 1,
          lineWidth: 7,
        },
        stockfinished: {
          key: "stockfinished",
          color: "white",
          opacity: 1,
          lineWidth: 7,
        },
        mainLine: {
          key: "mainLine",
          color: "#66AA66",
          opacity: 1,
          lineWidth: 9,
        },
        altLine: { key: "altLine", color: "#66AAAA", opacity: 1, lineWidth: 9 },
        blunderLine: {
          key: "blunderLine",
          color: "var(--incorrect-color)",
          opacity: 1,
          lineWidth: 7,
        },
        // default
        green: { key: "green", color: "green", opacity: 0.7, lineWidth: 9 },
        red: { key: "red", color: "red", opacity: 0.7, lineWidth: 9 },
        blue: { key: "blue", color: "blue", opacity: 0.7, lineWidth: 9 },
        yellow: { key: "yellow", color: "yellow", opacity: 0.7, lineWidth: 9 },
      },
    },
  });

  // --- Run Inital Setup ---
  augmentPgnTree(state.parsedPGN.moves as PgnMove[]);
  initializeUI();
  initPgnViewer();
  loadChessgroundBoard();
  positionPromoteOverlay();
  setupEventListeners();
});
</script>

<style scoped>
/* You can add component-specific styles here if needed */
</style>
