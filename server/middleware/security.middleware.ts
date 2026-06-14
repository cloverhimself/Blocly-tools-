import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Express } from "express";

export function setupSecurityMiddleware(app: Express) {
  // Helmet helps secure Express apps by setting HTTP response headers.
  app.use(helmet({
    contentSecurityPolicy: false, // Disabling for local dev with Vite if needed, but in prod we restrict it.
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.PUBLIC_APP_URL || "https://blocly.tools"] 
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
