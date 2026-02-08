// helper to check for modern copy API support
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try Modern API
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, trying fallback...", err);
  }

  // Fallback (for Anki Desktop / Qt WebEngine etc...)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure it's not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy failed", err);
    return false;
  }
}
let timer: ReturnType<typeof setTimeout>;
function showTooltip(targetBtn: HTMLElement, message: string) {
    // Create the Tooltip Element
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.className = 'global-tooltip'; // We will style this globally

    // Calculate Position (The "Portal" Magic)
    const rect = targetBtn.getBoundingClientRect();

    // Center horizontally on the button, position slightly above
    const left = rect.left + rect.width / 2;
    const top = rect.top - 5; // 10px gap above button

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // Append to Body (Escapes parent div overflow)
    document.body.appendChild(tooltip);

    // Animate In (Next Frame to allow DOM render)
    requestAnimationFrame(() => {
      tooltip.classList.add('visible');
    });

    // Cleanup
    clearTimeout(timer);
    timer = setTimeout(() => {
      tooltip.classList.remove('visible');
      // Wait for fade out transition before removing from DOM
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
        }
      }, 300); // Match CSS transition time
    }, 2000);
  }

interface ClipboardParams {
  text: string | (() => string);
  message?: string; // Optional custom message (default: "Copied!")
}

export function clickToCopy(node: HTMLElement, params: ClipboardParams | string) {
  async function handleClick() {
    const textVal = typeof params === 'string' ? params : params.text;
    const msg = typeof params === 'object' && params.message ? params.message : 'Copied!';
    const value = typeof textVal === 'function' ? textVal() : textVal;

    const success = await copyToClipboard(value);

    if (success) {
      showTooltip(node, msg);
    }
  }

  node.addEventListener('click', handleClick);
  return {
    update(newParams: ClipboardParams | string) {
      params = newParams;
    },
    destroy() {
      node.removeEventListener('click', handleClick);
      clearTimeout(timer);
    }
  };
}
