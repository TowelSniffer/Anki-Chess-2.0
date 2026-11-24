<script lang="ts">
  /*
   * A chess clock in a few strokes, that works like one: the running side's button is up and its
   * hand ticks towards 12 o'clock, where it stands at 0:00. One turn takes 10 s (not an hour), so
   * the hand is seen moving at this size.
   */
  type Side = 'left' | 'right';

  let {
    seconds = 0,
    side = 'left',
    running = false,
    low = false,
    flagged = false,
  }: {
    seconds?: number;
    side?: Side;
    running?: boolean;
    low?: boolean;
    flagged?: boolean;
  } = $props();

  const SECOND = 36; // degrees

  // Each hand stays where its side left it
  const angles = $state<Record<Side, number>>({ left: -60, right: -60 });

  $effect(() => {
    if (running || flagged) angles[side] = -SECOND * seconds;
  });

  const dials = [
    { side: 'left', x: 7 },
    { side: 'right', x: 17 },
  ] as const;
</script>

<svg
  class="chess-clock"
  class:low={low && !flagged}
  class:flagged
  viewBox="0 2 24 18.2"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="round"
  aria-hidden="true"
>
  <rect x="1" y="8" width="22" height="11.4" rx="2.8" />
  {#each dials as dial (dial.side)}
    <!-- The button: down on the side that isn't running -->
    <line
      class="button"
      class:down={side !== dial.side}
      x1={dial.x - 2.2}
      x2={dial.x + 2.2}
      y1="3.6"
      y2="3.6"
    />
    <g transform="translate({dial.x} 13.7)">
      <circle r="3.3" stroke-width="1.3" />
      <g class="hand" style:transform="rotate({angles[dial.side]}deg)">
        <line y2="-2.1" stroke-width="1.2" />
      </g>
    </g>
  {/each}
</svg>

<style lang="scss">
  .chess-clock {
    height: 1.3em;
    width: auto;
    flex-shrink: 0;
    overflow: visible;
    display: block;

    &.low {
      animation: chess-clock-beat 1s ease-in-out infinite;
    }

    &.flagged {
      animation: chess-clock-fall 420ms ease-out;
    }
  }

  .hand {
    /* A mechanical tick, with a little overshoot */
    transition: transform 260ms cubic-bezier(0.34, 1.7, 0.64, 1);
  }

  .button {
    transition: transform 130ms ease-out;

    &.down {
      transform: translateY(2.1px);
    }
  }

  @keyframes chess-clock-beat {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @keyframes chess-clock-fall {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-1.5px) rotate(-3deg);
    }
    60% {
      transform: translateX(1.5px) rotate(3deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chess-clock.low,
    .chess-clock.flagged {
      animation: none;
    }
    .hand,
    .button {
      transition: none;
    }
  }
</style>
