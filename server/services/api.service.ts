import { SignJWT, decodeJwt } from "jose";
import { format } from "sql-formatter";
import { faker } from "@faker-js/faker";

export class ApiService {
  
  static formatJson(jsonString: string, spaces: number = 2): string {
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, spaces);
    } catch (e: any) {
      throw new Error(`Invalid JSON: ${e.message}`);
    }
  }

  static async generateJwt(payload: any, secret: string, expiresIn: string): Promise<string> {
    const alg = 'HS256';
    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setExpirationTime(expiresIn)
      .sign(new TextEncoder().encode(secret));
  }

  static decodeJwtToken(token: string): any {
    return decodeJwt(token);
  }

  static formatSql(sql: string, dialect: string = "postgresql"): string {
    return format(sql, { language: dialect as any });
  }

  static generateTestData(dataType: string, count: number): any[] {
     faker.seed(Date.now());
     const results = [];
     for(let i=0; i<count; i++) {
        switch(dataType) {
           case 'users':
              results.push({
                 id: faker.string.uuid(),
                 firstName: faker.person.firstName(),
                 lastName: faker.person.lastName(),
                 email: faker.internet.email()
              });
              break;
           case 'products':
              results.push({
                 id: faker.string.uuid(),
                 name: faker.commerce.productName(),
                 price: faker.commerce.price(),
              });
              break;
           default:
              results.push({ id: faker.string.uuid(), name: faker.word.sample() });
        }
     }
     return results;
  }
}
