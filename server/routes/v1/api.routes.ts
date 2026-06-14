import { Router, Request, Response } from "express";
import { UtilsController } from "../../controllers/utils.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// ... existing routes ...

router.post("/proxy", validateRequest(z.object({
  body: z.object({
    url: z.string().url(),
    method: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional()
  })
})), async (req: Request, res: Response) => {
  try {
    const { url, method, headers, body } = req.body;
    
    // Security check: only allow http/https, deny localhost, metadata IP, internal network
    const targetUrl = new URL(url);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return res.status(400).json({ error: "Invalid protocol" });
    }
    const hostname = targetUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '169.254.169.254' || hostname === '::1' || hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return res.status(403).json({ error: "Internal network access forbidden" });
    }

    const fetchOpts: RequestInit = {
      method,
      headers: headers as HeadersInit,
    };
    if (body) {
      fetchOpts.body = typeof body === 'object' ? JSON.stringify(body) : body;
    }

    const response = await fetch(url, fetchOpts);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      responseHeaders[k] = v;
    });

    const responseText = await response.text();

    return res.json({
      status: response.status,
      headers: responseHeaders,
      body: responseText
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/uuid", validateRequest(z.object({
  body: z.object({
    version: z.enum(['v1', 'v4']).optional(),
    count: z.number().min(1).max(1000).optional()
  })
})), UtilsController.generateUuid);

router.post("/json/format", validateRequest(z.object({
  body: z.object({
    json: z.string(),
    spaces: z.number().min(0).max(8).optional()
  })
})), UtilsController.formatJson);

router.post("/jwt/generate", validateRequest(z.object({
  body: z.object({
    payload: z.record(z.string(), z.any()),
    secret: z.string(),
    expiresIn: z.string().optional()
  })
})), UtilsController.generateJwt);

router.post("/jwt/decode", validateRequest(z.object({
  body: z.object({
    token: z.string()
  })
})), UtilsController.decodeJwt);

router.post("/sql/format", validateRequest(z.object({
  body: z.object({
    sql: z.string(),
    dialect: z.string().optional()
  })
})), UtilsController.formatSql);

router.post("/test-data/generate", validateRequest(z.object({
  body: z.object({
    dataType: z.string().optional(),
    count: z.number().min(1).max(5000).optional()
  })
})), UtilsController.generateTestData);

export default router;
