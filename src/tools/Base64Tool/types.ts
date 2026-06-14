export interface Base64Input {
  text: string;
  mode: 'encode' | 'decode';
}

export type Base64Output = string;
