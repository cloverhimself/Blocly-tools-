import { Request, Response } from "express";
import { UtilsService } from "../services/utils.service";
import { ApiService } from "../services/api.service";
import { sendSuccess, sendError } from "../utils/response";

export class UtilsController {
  static generateUuid(req: Request, res: Response) {
    try {
      const { version = 'v4', count = 1 } = req.body;
      const data = UtilsService.generateUuid(version as 'v4'|'v1', count);
      sendSuccess(res, { uuids: data });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  static formatJson(req: Request, res: Response) {
    try {
      const { json, spaces = 2 } = req.body;
      const formatted = ApiService.formatJson(json, spaces);
      sendSuccess(res, { formatted });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  static async generateJwt(req: Request, res: Response) {
    try {
      const { payload, secret, expiresIn = '1h' } = req.body;
      const token = await ApiService.generateJwt(payload, secret, expiresIn);
      sendSuccess(res, { token });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  static decodeJwt(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const payload = ApiService.decodeJwtToken(token);
      sendSuccess(res, { payload });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  static formatSql(req: Request, res: Response) {
    try {
      const { sql, dialect = 'postgresql' } = req.body;
      const formatted = ApiService.formatSql(sql, dialect);
      sendSuccess(res, { formatted });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  static generateTestData(req: Request, res: Response) {
    try {
      const { dataType = 'users', count = 10 } = req.body;
      const data = ApiService.generateTestData(dataType, count);
      sendSuccess(res, { data });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }
}
