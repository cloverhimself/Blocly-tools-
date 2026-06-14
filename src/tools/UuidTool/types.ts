export interface UuidInput {
  count: number;
  version: 'v1' | 'v4';
}

export type UuidOutput = string[];
