import { UrlEncoderInput, UrlEncoderOutput } from './types';

export function processUrl(input: UrlEncoderInput): UrlEncoderOutput {
  if (!input.text) return '';
  
  if (input.mode === 'encode') {
    return encodeURIComponent(input.text);
  } else {
    // decodeURIComponent throws if malformed
    return decodeURIComponent(input.text);
  }
}
