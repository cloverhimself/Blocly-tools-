import { v4 as uuidv4, v1 as uuidv1 } from "uuid";

// We'll need to install uuid and @types/uuid if not present, but let's build logic first.
export class UtilsService {
  static generateUuid(version: 'v4' | 'v1', count = 1): string[] {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
       results.push(version === 'v1' ? uuidv1() : uuidv4());
    }
    return results;
  }
}
