import { Router, Request, Response } from "express";
import { UtilsController } from "../../controllers/utils.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { z } from "zod";
import dns from "dns/promises";
import net from "net";

const router = Router();
const PROXY_TIMEOUT_MS = 15_000;
const PROXY_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const ALLOWED_PROXY_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const BLOCKED_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "cookie",
  "host",
  "proxy-authorization",
  "proxy-connection",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);
const BLOCKED_RESPONSE_HEADERS = new Set(["set-cookie", "set-cookie2"]);

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

function isBlockedIPv4(ip: string): boolean {
  const p = parseIPv4(ip);
  if (!p) return true;
  const [a, b] = p;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 ||
    a === 192 && b === 168 ||
    a === 100 && b >= 64 && b <= 127 ||
    a === 192 && b === 0 ||
    a === 198 && (b === 18 || b === 19) ||
    a >= 224
  );
}

function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIPv4(mapped[1]);
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("2001:db8:")
  );
}

function isBlockedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isBlockedIPv4(ip);
  if (version === 6) return isBlockedIPv6(ip);
  return true;
}

function getUrlHostname(targetUrl: URL): string {
  return targetUrl.hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  const targetUrl = new URL(rawUrl);
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    throw new Error("Only http(s) links are supported.");
  }

  const hostname = getUrlHostname(targetUrl);
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Internal network access is forbidden.");
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new Error("Internal network access is forbidden.");
    return targetUrl;
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((addr) => isBlockedIp(addr.address))) {
    throw new Error("Internal network access is forbidden.");
  }

  return targetUrl;
}

function filterProxyRequestHeaders(headers?: Record<string, string>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const normalized = key.trim().toLowerCase();
    if (!normalized || BLOCKED_REQUEST_HEADERS.has(normalized) || normalized.startsWith("proxy-")) continue;
    clean[key.trim()] = value;
  }
  return clean;
}

async function readTextWithLimit(response: globalThis.Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      reader.cancel().catch(() => {});
      throw new Error("Response is too large to display.");
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return body;
}

// ... existing routes ...

router.post("/proxy", validateRequest(z.object({
  body: z.object({
    url: z.string().url(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional()
  })
})), async (req: Request, res: Response) => {
  try {
    const { url, method, headers, body } = req.body;
    const targetUrl = await assertPublicHttpUrl(url);
    const normalizedMethod = String(method).toUpperCase();
    if (!ALLOWED_PROXY_METHODS.has(normalizedMethod)) {
      return res.status(400).json({ error: "Unsupported HTTP method" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    const fetchOpts: RequestInit = {
      method: normalizedMethod,
      headers: filterProxyRequestHeaders(headers),
      redirect: "manual",
      signal: controller.signal,
    };
    if (body != null && normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
      fetchOpts.body = typeof body === "object" ? JSON.stringify(body) : String(body);
    }

    let response: globalThis.Response;
    try {
      response = await fetch(targetUrl, fetchOpts);
    } finally {
      clearTimeout(timeout);
    }
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      if (BLOCKED_RESPONSE_HEADERS.has(k.toLowerCase())) return;
      responseHeaders[k] = v;
    });

    const responseText = normalizedMethod === "HEAD" ? "" : await readTextWithLimit(response, PROXY_MAX_RESPONSE_BYTES);

    return res.json({
      status: response.status,
      headers: responseHeaders,
      body: responseText
    });
  } catch (error: any) {
    const message = error?.name === "AbortError" ? "Request timed out." : error.message;
    const status = /internal network|only http/i.test(message) ? 403 : 500;
    return res.status(status).json({ error: message });
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
