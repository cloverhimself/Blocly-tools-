export interface TimestampConverterInput {
  unix?: string;
  human?: string;
  action: 'unix-to-human' | 'human-to-unix';
}

export interface TimestampConverterOutput {
  unix: string;
  human: string;
}
