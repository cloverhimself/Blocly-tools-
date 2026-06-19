import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Express } from "express";

function productionOrigins(): string[] {
  const configured = process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://blocly.tools";
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function setupSecurityMiddleware(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";

  // Helmet helps secure Express apps by setting HTTP response headers.
  app.use(helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            mediaSrc: ["'self'", "blob:"],
            connectSrc: [
              "'self'",
              "https://api.github.com",
              "https://unpkg.com",
              "https://*.supabase.co",
              "wss://*.supabase.co",
            ],
            workerSrc: ["'self'", "blob:"],
            manifestSrc: ["'self'"],
            formAction: ["'self'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: isProduction
      ? productionOrigins()
      : "*", 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply to all API routes
  app.use('/api', limiter);
}
