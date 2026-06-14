import { HashGeneratorInput, HashGeneratorOutput } from './types';

const utf8Encode = new TextEncoder();

const getHash = async (algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string) => {
  if (!text) return '';
  try {
    const data = utf8Encode.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    throw new Error('Environment does not support Web Crypto API');
  }
};

export async function generateHashes(input: HashGeneratorInput): Promise<HashGeneratorOutput> {
  if (!input.input) {
    return { sha1: '', sha256: '', sha512: '' };
  }

  const [sha1, sha256, sha512] = await Promise.all([
    getHash('SHA-1', input.input),
    getHash('SHA-256', input.input),
    getHash('SHA-512', input.input),
  ]);

  return { sha1, sha256, sha512 };
}
