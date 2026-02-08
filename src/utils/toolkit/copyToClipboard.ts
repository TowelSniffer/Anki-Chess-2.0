export async function copyToClipboard(text: string): Promise<boolean> {
  // Priority: Try Synchronous "execCommand" first.
  // This is REQUIRED for Anki / Qt because they rely on the active 'click' event.
  // If we 'await' the modern API first, the click event expires, and using this as fallback will fail.
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // minimal CSS to hide it but keep it functional
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    // This runs instantly. If it works, we return true immediately.
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
  } catch (err) {
    console.warn("Sync copy failed, attempting modern fallback...", err);
  }

  // Secondary: Modern Async API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Async copy also failed", err);
    }
  }

  return false;
}

/**
 * Creates and displays the tooltip.
 * Returns the DOM element and the Timer ID so the caller can manage cleanup.
 */
function showTooltip(targetBtn: HTMLElement, message: string) {
    // Create the Tooltip Element
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.className = 'global-tooltip'; // Must match your global CSS class name

    // Calculate Position
    const rect = targetBtn.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = rect.top - 5; // 5px gap above button

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // Append to Body (avoids parent overfow issues)
    document.body.appendChild(tooltip);

    // Animate In
    requestAnimationFrame(() => {
      tooltip.classList.add('visible');
    });

    // Schedule Removal
    const timer = setTimeout(() => {
      tooltip.classList.remove('visible');
      // Wait for fade out transition before removing from DOM
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
        }
      }, 300); // Match CSS transition time
    }, 2000);

    return { tooltip, timer };
}

interface ClipboardParams {
  text: string | (() => string);
  message?: string; // Optional custom message (default: "Copied!")
}

export function clickToCopy(node: HTMLElement, params: ClipboardParams | string) {
  // We track BOTH the timer and the actual element to prevent stacking
  let activeTimer: ReturnType<typeof setTimeout> | undefined;
  let activeTooltip: HTMLElement | null = null;

  async function handleClick() {
    const textVal = typeof params === 'string' ? params : params.text;
    const msg = typeof params === 'object' && params.message ? params.message : 'Copied!';
    const value = typeof textVal === 'function' ? textVal() : textVal;

    const success = await copyToClipboard(value);

    if (success) {
      // CLEANUP: If a tooltip is already showing, kill it immediately
      if (activeTooltip) {
        if (document.body.contains(activeTooltip)) {
            document.body.removeChild(activeTooltip);
        }
        clearTimeout(activeTimer);
      }

      // SHOW NEW: Store the new references
      const result = showTooltip(node, msg);
      activeTooltip = result.tooltip;
      activeTimer = result.timer;
    }
  }

  node.addEventListener('click', handleClick);

  return {
    update(newParams: ClipboardParams | string) {
      params = newParams;
    },
    destroy() {
      node.removeEventListener('click', handleClick);
      // Clean up on component destroy
      if (activeTimer) clearTimeout(activeTimer);
      if (activeTooltip && document.body.contains(activeTooltip)) {
        document.body.removeChild(activeTooltip);
      }
    }
  };
}
