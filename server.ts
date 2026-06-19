import express from 'express';
import path from 'path';
import compression from 'compression';
import { setupSecurityMiddleware } from './server/middleware/security.middleware';
import apiRoutes from './server/routes/v1/api.routes';
import multer from 'multer';

// For memory-based file processing (to avoid disk ops where possible)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
const UPLOAD_ROUTE_TIMEOUT_MS = 60_000;
const ZIP_MAGICS = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
];
const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46];

function hasMagic(buffer: Buffer, magic: number[]): boolean {
  return buffer.length >= magic.length && magic.every((byte, index) => buffer[index] === byte);
}

function isZip(buffer: Buffer): boolean {
  return ZIP_MAGICS.some((magic) => hasMagic(buffer, magic));
}

function isOleOffice(buffer: Buffer): boolean {
  return hasMagic(buffer, OLE_MAGIC);
}

function isPdf(buffer: Buffer): boolean {
  return hasMagic(buffer, PDF_MAGIC);
}

function rejectInvalidFile(res: express.Response, expected: string) {
  return res.status(400).json({ success: false, error: `Invalid file type. Please upload a valid ${expected} file.` });
}

async function startServer() {
  const app = express();
  // Cloud hosts (Render, Railway, Fly, …) inject the port to bind to.
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Core middlewares
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 2. Security & Rate Limiting
  setupSecurityMiddleware(app);

  // 3. API Routes (v1)
  app.use('/api/v1', apiRoutes);

  // 4. File Processing Routes (Moving to memory/streams)
  app.post("/api/v1/convert/excel-csv", upload.single("file"), async (req, res) => {
    req.setTimeout(UPLOAD_ROUTE_TIMEOUT_MS);
    try {
      if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
      
      const fileBuffer = req.file.buffer;
      if (!isZip(fileBuffer) && !isOleOffice(fileBuffer)) return rejectInvalidFile(res, "Excel");
      const xlsxModule = await import("xlsx");
      const xlsx = xlsxModule.default || xlsxModule;
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      
      res.header("Content-Type", "text/csv");
      res.attachment("converted.csv");
      res.send(csv);
    } catch {
      res.status(500).json({ success: false, error: "Failed to convert Excel to CSV. Please check that the file is valid and try again." });
    }
  });

  app.post("/api/v1/convert/pdf-word", upload.single("file"), async (req, res) => {
    req.setTimeout(UPLOAD_ROUTE_TIMEOUT_MS);
    try {
      if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
      
      const fileBuffer = req.file.buffer;
      if (!isPdf(fileBuffer)) return rejectInvalidFile(res, "PDF");
      const targetFormat = req.body.targetFormat === 'doc' ? 'doc' : 'docx';
      
      const pdfParseModule: any = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(fileBuffer);
      
      if (targetFormat === 'docx') {
         const docxModule: any = await import("docx");
         const { Document, Packer, Paragraph, TextRun } = docxModule.default || docxModule;
         
         const paragraphs = data.text.split('\\n').map((line: string) => 
            new Paragraph({ children: [new TextRun(line)] })
         );
         
         const doc = new Document({
            sections: [{ properties: {}, children: paragraphs }]
         });
         
         const b64string = await Packer.toBase64String(doc);
         const buffer = Buffer.from(b64string, 'base64');
         
         res.header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
         res.attachment("converted.docx");
         res.send(buffer);
      } else {
          res.header("Content-Type", "application/msword");
          res.attachment(`converted.${targetFormat}`);
          res.send(data.text);
       }
    } catch {
      res.status(500).json({ success: false, error: "Failed to convert PDF. Please check that the file is valid and try again." });
    }
  });

  app.post("/api/v1/convert/word-pdf", upload.single("file"), async (req, res) => {
    req.setTimeout(UPLOAD_ROUTE_TIMEOUT_MS);
    try {
      if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
      
      const fileBuffer = req.file.buffer;
      if (!isZip(fileBuffer) && !isOleOffice(fileBuffer)) return rejectInvalidFile(res, "Word");
      const mammothModule = await import("mammoth");
      const mammoth = mammothModule.default || mammothModule;
      const pdfLibModule = await import("pdf-lib");
      const { PDFDocument } = pdfLibModule.default || pdfLibModule;
      
      const { value: text } = await mammoth.extractRawText({ buffer: fileBuffer });
      
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const { height } = page.getSize();
      
      const lines = text.split('\\n');
      let y = height - 50;
      
      for (const line of lines) {
        if (y < 50) {
           page = pdfDoc.addPage();
           y = height - 50;
        }
        let currentLine = line.substring(0, 80);
        page.drawText(currentLine, { x: 50, y, size: 12 });
        y -= 16;
      }
      
      const pdfBytes = await pdfDoc.save();
      res.header("Content-Type", "application/pdf");
      res.attachment("converted.pdf");
      res.send(Buffer.from(pdfBytes));
    } catch {
      res.status(500).json({ success: false, error: "Failed to convert Word to PDF. Please check that the file is valid and try again." });
    }
  });

  // 5. Frontend & Vite Proxy
  if (process.env.NODE_ENV !== 'production') {
    // Loaded only in dev so production never needs `vite` installed at runtime.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
