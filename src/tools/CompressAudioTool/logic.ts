import { CompressAudioInput, CompressAudioOutput } from './types';
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function compressAudio(input: CompressAudioInput): Promise<CompressAudioOutput> {
  if (!input.file) {
    throw new Error("No file provided");
  }

  if (input.file.size > 2 * 1024 * 1024 * 1024) {
    throw new Error("File is too large (max 2GB supported by browser memory).");
  }

  try {
    if (!ffmpeg) {
      ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
    } else {
      // Remove previous listener to avoid multiple triggers if tool runs consecutively
      ffmpeg.off("progress", () => {});
    }

    if (input.onProgress) {
      // Small simulated buffer for loading UI before transcoding starts
      input.onProgress(0);
    }

    ffmpeg.on("progress", ({ progress }) => {
      if (input.onProgress) {
        input.onProgress(progress * 100);
      }
    });

    const extension = input.file.name.substring(input.file.name.lastIndexOf('.'));
    const inputName = 'input' + extension;
    const originalName = input.file.name.substring(0, input.file.name.lastIndexOf('.'));
    const outputFormat = 'mp3';
    const outputName = 'output.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(input.file));

    const args = [
      "-i", inputName,
      "-acodec", "libmp3lame",
      "-b:a", `${input.quality}k`,
      outputName
    ];

    await ffmpeg.exec(args);

    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    
    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
    // Remove listeners so they don't compound
    ffmpeg.off("progress", () => {});

    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    return {
      fileUrl: url,
      originalSize: input.file.size,
      compressedSize: blob.size,
      format: outputFormat,
      fileName: originalName + "_compressed." + outputFormat
    };
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred during compression');
  }
}
