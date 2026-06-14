export interface CompressAudioInput {
  file: File;
  quality: 64 | 96 | 128 | 192;
  onProgress?: (progress: number) => void;
}

export interface CompressAudioOutput {
  fileUrl: string;
  originalSize: number;
  compressedSize: number;
  format: string;
  fileName: string;
}
