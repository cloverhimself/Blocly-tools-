import { JsonFormatterInput, JsonFormatterOutput } from './types';

export function formatJson(input: JsonFormatterInput): JsonFormatterOutput {
  if (!input.input.trim()) {
    return '';
  }

  try {
    const parsed = JSON.parse(input.input);
    if (input.spaces === 0) {
      return JSON.stringify(parsed);
    } else {
      return JSON.stringify(parsed, null, input.spaces);
    }
  } catch (err: any) {
    throw new Error(err.message || 'Invalid JSON syntax');
  }
}
