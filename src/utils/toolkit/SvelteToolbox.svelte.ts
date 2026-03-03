// Log a previous value for a $state
export function trackPrevious(getter) {
  let previous = $state();
  let current = $state(getter());

  $effect(() => {
    const next = getter();
    if (next !== current) {
      previous = current;
      current = next;
    }
  });

  return {
    get value() {
      return previous;
    }
  };
}
