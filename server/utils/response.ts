import { Response } from "express";

export const sendSuccess = (res: Response, data: any, meta?: any, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
};

export const sendError = (res: Response, error: string, statusCode = 400, details?: any) => {
  res.status(statusCode).json({
    success: false,
    error,
    details,
  });
};
