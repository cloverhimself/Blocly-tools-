# Blocly Tools

Blocly Tools is a privacy-first, blazing fast utility platform designed for developers and power users. 
It provides a suite of essential developer workflows, document converters, and image utilities.

## Architecture

We are built on a **Hybrid Tool Platform** model:

### 1. Client-Side Tools (Primary Layer)
Most tools in Blocly never touch a server. They run entirely via Web APIs in your browser to process data instantaneously.
*   **Privacy-first**: Your payloads (JSON, YAML, images) never leave your device.
*   **Speed**: Zero network overhead.
*   **Tools**: JSON formatting, Hash/UUID generators, Base64 encoding, Image Compression, Color manipulation, Regex tools, QR code generation, etc.

### 2. Server-Assisted Tools (Limited Layer)
We utilize a lightweight Express/Serverless layer strictly for heavy operations that cannot reliably perform within the browser sandbox (e.g., bypassing CORS for API testing, compiling complex PDF/Word binaries).
*   **No persistent storage**: The backend does NOT save user data.
*   **Tools**: REST API Proxy, HTTP Header analysis, Document to PDF (planned).

## Core Principles
- **No Login Required**: The platform is open and immediately usable. We do not enforce accounts.
- **Client-First**: We process on your computer whenever technologically possible.

## Tech Stack
- React 19 + Vite
- Tailwind CSS 4
- Express + Node.js (for proxy API and cloud fallbacks)
- `lucide-react` for iconography

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Run the production build:
   ```bash
   npm run start
   ```

Enjoy a faster, safer toolset.
