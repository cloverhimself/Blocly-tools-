import type { Metadata } from "next";
import { Providers } from "./providers";
import "../src/index.css";

export const metadata: Metadata = {
  title: "Blocly Tools - Free Online Tools for Everyday Work",
  description:
    "A privacy-first collection of developer, document, image, PDF, and everyday utilities.",
  openGraph: {
    title: "Blocly Tools - Free Online Tools for Everyday Work",
    description:
      "A privacy-first collection of developer, document, image, PDF, and everyday utilities.",
    siteName: "Blocly Tools",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blocly Tools - Free Online Tools for Everyday Work",
    description:
      "A privacy-first collection of developer, document, image, PDF, and everyday utilities.",
    site: "@clover_himself",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
