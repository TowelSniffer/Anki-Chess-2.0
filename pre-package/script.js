
    function changeAudio(gameState) {
      const audio = document.getElementById("myAudio");
      if (gameState.san.includes("#")) {
      audio.src = "_checkmate.mp3"
      } else if (gameState.san.includes("+")) {
      audio.src = "_move-check.mp3"
      } else if (gameState.flags.includes("c")) {
      audio.src = "_Capture.mp3"
      } else if (gameState.flags.includes("k") || gameState.flags.includes("q")) {
      audio.src = "_castle.mp3"
      } else if (gameState.flags.includes("p")) {
      audio.src = "_promote.mp3"
      } else {
      audio.src = "_Move.mp3"
      }
      audio.play();
    };


    function getContentWidth(element) {
      // my attempt a keeping consistent sizing with different screens. having a dynamic widt and border makes for issues centering on narrow screens so this calculates the width inside of a border
      const computedStyle = window.getComputedStyle(element);
      const width = parseFloat(computedStyle.width);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingRight = parseFloat(computedStyle.paddingRight);
      const borderLeft = parseFloat(computedStyle.borderLeftWidth);
      const borderRight = parseFloat(computedStyle.borderRightWidth);

      return width - paddingLeft - paddingRight - borderLeft - borderRight;
    }

    function reload() {
      count = 0; // Int so we can track on which move we are.
      expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
      expectedMove = parsedPGN.moves[count]; // Set the expected move according to PGN

      ChessgroundExamples.run(document.getElementById('chessground-examples'));
      const el = document.querySelector('.cg-wrap');
      if (el) {
          el.style.border = "6px solid var(--border-color)";
          el.style.boxShadow ="0px 0px 6px 0px var(--border-shadow)";
      }
    }
    let vh = 12;

    function positionPromoteOverlay() {
      const promoteOverlay = document.getElementById('center');
      const rect = document.querySelector('.cg-wrap').getBoundingClientRect();
      // Set the position of the promote element
      promoteOverlay.style.top = (rect.top + 6) + 'px';
      promoteOverlay.style.left = (rect.left + 6) + 'px';
      window.addEventListener('resize', resizeBoard);
    }

    async function resizeBoard() {
      positionPromoteOverlay();
    }


    async function loadElements() {
      await reload();
      // await resizeBoard();

      setTimeout(() => {
        positionPromoteOverlay();
      }, 200);
    }

    if (muteAudio == 'true') {
      const audioElement = document.getElementById("myAudio");
      audioElement.muted = true;
    }

    loadElements();


    