import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: (error as any).errors,
        });
      }
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
};
