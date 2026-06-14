import { useCallback } from 'react';

export function useDownload() {
  const downloadText = useCallback((filename: string, content: string, mimeType = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Download failed', e);
      return false;
    }
  }, []);

  const downloadBlob = useCallback((filename: string, blob: Blob) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Download failed', e);
      return false;
    }
  }, []);

  const downloadUrl = useCallback((filename: string, url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { downloadText, downloadBlob, downloadUrl };
}
