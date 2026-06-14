import { RegexTesterInput, RegexTesterOutput, RegexMatchGroup } from './types';

export function testRegex(input: RegexTesterInput): RegexTesterOutput {
  if (!input.regexStr) {
    return [];
  }

  let regex: RegExp;
  try {
    regex = new RegExp(input.regexStr, input.flags);
  } catch (err: any) {
    throw new Error(err.message || 'Invalid regular expression');
  }

  const matches: RegexMatchGroup[] = [];

  try {
    if (regex.test(input.testString) || input.testString.match(regex)) {
      if (input.flags.includes('g')) {
        const arr = [...input.testString.matchAll(regex)];
        for (const m of arr) {
          matches.push({
            match: m[0],
            index: m.index || 0,
            groups: Array.from(m).slice(1)
          });
        }
      } else {
        const match = input.testString.match(regex);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index || 0,
            groups: Array.from(match).slice(1)
          });
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while matching');
  }

  return matches;
}
