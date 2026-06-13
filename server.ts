import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Helper API to proxy requests to avoid CORS for tools
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;
      
      const response = await fetch(url, {
        method: method || 'GET',
        headers: headers || {},
        ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {})
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      const responseText = await response.text();
      
      res.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseText
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to make request" });
    }
  });

  // Placeholder for heavy cloud processing tool
  app.post("/api/cloud/:toolType", async (req, res) => {
    const { toolType } = req.params;
    res.json({ message: `Cloud processing for ${toolType} is not fully implemented in the MVP.` });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
