export interface RegexTesterInput {
  regexStr: string;
  flags: string;
  testString: string;
}

export type RegexMatchGroup = {
  match: string;
  index: number;
  groups: string[];
};

export type RegexTesterOutput = RegexMatchGroup[];
