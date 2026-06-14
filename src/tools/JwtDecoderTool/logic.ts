import { JwtDecoderInput, JwtDecoderOutput } from './types';

export function decodeJwt(input: JwtDecoderInput): JwtDecoderOutput {
  if (!input.token.trim()) {
    return { header: '', payload: '' };
  }

  const parts = input.token.split('.');
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: Must contain exactly 3 parts separated by dots.");
  }

  // Base64URL decode
  const decodeB64Url = (str: string) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding
    const pad = base64.length % 4;
    const padded = pad ? base64 + new Array(5 - pad).join('=') : base64;
    return decodeURIComponent(escape(atob(padded)));
  };

  try {
    const decodedHeader = JSON.parse(decodeB64Url(parts[0]));
    const decodedPayload = JSON.parse(decodeB64Url(parts[1]));

    return {
      header: JSON.stringify(decodedHeader, null, 2),
      payload: JSON.stringify(decodedPayload, null, 2)
    };
  } catch (e: any) {
    throw new Error(e.message || "Failed to decode JWT.");
  }
}
