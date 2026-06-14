import { useState, useCallback } from 'react';

export function useClipboard(duration = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!text) return false;

      try {
        await navigator.clipboard.writeText(text);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), duration);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard', error);
        return false;
      }
    },
    [duration]
  );

  return { hasCopied, copyToClipboard };
}
