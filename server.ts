import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

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

  // Convert Excel to CSV
  app.post("/api/convert/excel-csv", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const xlsxModule = await import("xlsx");
      const xlsx = xlsxModule.default || xlsxModule;
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      res.header("Content-Type", "text/csv");
      res.attachment("converted.csv");
      res.send(csv);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to convert Excel to CSV" });
    }
  });

  // Convert PDF to Document (Text extraction proxying as doc/docx)
  app.post("/api/convert/pdf-word", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const targetFormat = req.body.targetFormat || 'docx';
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(req.file.buffer);
      
      if (targetFormat === 'docx') {
         const docxModule = await import("docx");
         const { Document, Packer, Paragraph, TextRun } = docxModule.default || docxModule;
         
         const paragraphs = data.text.split('\\n').map((line: string) => 
            new Paragraph({
               children: [new TextRun(line)]
            })
         );
         
         const doc = new Document({
            sections: [{
               properties: {},
               children: paragraphs
            }]
         });
         
         const b64string = await Packer.toBase64String(doc);
         const buffer = Buffer.from(b64string, 'base64');
         
         res.header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
         res.attachment("converted.docx");
         res.send(buffer);
      } else {
         // fallback for manually outputting raw text as legacy format
         res.header("Content-Type", "application/msword");
         res.attachment(`converted.${targetFormat}`);
         res.send(data.text);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to convert PDF" });
    }
  });

  // Convert Word to PDF (Text extraction wrapped in basic PDF layout)
  app.post("/api/convert/word-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const mammothModule = await import("mammoth");
      const mammoth = mammothModule.default || mammothModule;
      const pdfLibModule = await import("pdf-lib");
      const { PDFDocument } = pdfLibModule.default || pdfLibModule;
      
      const { value: text } = await mammoth.extractRawText({ buffer: req.file.buffer });
      
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      const lines = text.split('\\n');
      let y = height - 50;
      
      for (const line of lines) {
        if (y < 50) {
           page = pdfDoc.addPage();
           y = height - 50;
        }
        // Basic naive line wrapping and drawing
        let currentLine = line.substring(0, 80);
        page.drawText(currentLine, { x: 50, y, size: 12 });
        y -= 16;
      }
      
      const pdfBytes = await pdfDoc.save();
      res.header("Content-Type", "application/pdf");
      res.attachment("converted.pdf");
      res.send(Buffer.from(pdfBytes));
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to convert Word to PDF" });
    }
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
