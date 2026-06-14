import { TimestampConverterInput, TimestampConverterOutput } from './types';

export function convertTimestamp(input: TimestampConverterInput): TimestampConverterOutput {
  if (input.action === 'unix-to-human') {
    if (!input.unix) return { unix: '', human: '' };
    
    const nm = parseInt(input.unix);
    if (isNaN(nm)) throw new Error("Invalid Unix timestamp");
    
    const ms = String(nm).length > 10 ? nm : nm * 1000;
    const d = new Date(ms);
    if (d.toString() === "Invalid Date") throw new Error("Invalid timestamp range");
    
    return {
      unix: input.unix,
      human: d.toISOString().slice(0, 19).replace('T', ' ')
    };
  } else {
    if (!input.human) return { unix: '', human: '' };
    
    const d = new Date(input.human + " GMT");
    if (d.toString() === "Invalid Date") throw new Error("Invalid date format (try YYYY-MM-DD HH:mm:ss)");
    
    return {
      human: input.human,
      unix: Math.floor(d.getTime() / 1000).toString()
    };
  }
}
