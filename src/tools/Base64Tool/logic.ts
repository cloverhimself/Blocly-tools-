import { Base64Input, Base64Output } from './types';

export function processBase64(input: Base64Input): Base64Output {
  if (!input.text) return '';

  if (input.mode === 'encode') {
    return btoa(unescape(encodeURIComponent(input.text)));
  } else {
    return decodeURIComponent(escape(atob(input.text)));
  }
}
