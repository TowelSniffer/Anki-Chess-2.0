/**
 * Action to detect clicks outside a specific node.
 */
export function clickOutside(
  node: HTMLElement,
  callback: (e: MouseEvent) => void,
) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      callback(event); // Pass the event back to the component
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}
