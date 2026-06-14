export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
  status: 'stable' | 'beta' | 'deprecated';
  keywords: string[];
  iconName?: string;
}

export const toolRegistry: Record<string, ToolDefinition> = {
  uuid: {
    id: "uuid",
    name: "UUID Generator",
    category: "Developer",
    description: "Generate universally unique identifiers",
    route: "/tools/uuid",
    status: "stable",
    keywords: ["uuid", "guid", "generate", "v4", "v1", "identifier"],
    iconName: "Fingerprint"
  },
  base64: {
    id: "base64",
    name: "Base64 Encode / Decode",
    category: "Developer",
    description: "Text and small files",
    route: "/tools/base64",
    status: "stable",
    keywords: ["base64", "encode", "decode", "text", "format", "convert"],
    iconName: "Replace"
  },
  urlEncoder: {
    id: "urlEncoder",
    name: "URL Encoder / Decoder",
    category: "Developer",
    description: "Encode or decode URLs",
    route: "/tools/url-encoder",
    status: "stable",
    keywords: ["url", "encode", "decode", "uri", "percent", "escape"],
    iconName: "Link2"
  },
  jsonFormatter: {
    id: "jsonFormatter",
    name: "JSON Formatter",
    category: "Developer",
    description: "Prettify, minify and validate",
    route: "/tools/json",
    status: "stable",
    keywords: ["json", "format", "prettify", "minify", "validate", "lint", "beautify"],
    iconName: "Braces"
  },
  jwtDecoder: {
    id: "jwtDecoder",
    name: "JWT Decoder",
    category: "Developer",
    description: "Decode JSON Web Tokens",
    route: "/tools/jwt",
    status: "stable",
    keywords: ["jwt", "token", "decode", "parse", "json web token"],
    iconName: "Key"
  },
  hashGenerator: {
    id: "hashGenerator",
    name: "Hash Generator",
    category: "Developer",
    description: "SHA-256, SHA-1 and MD5",
    route: "/tools/hash",
    status: "stable",
    keywords: ["hash", "md5", "sha1", "sha256", "sha512", "crypto", "generate"],
    iconName: "Hash"
  },
  regexTester: {
    id: "regexTester",
    name: "Regex Tester",
    category: "Developer",
    description: "Test and debug regular expressions",
    route: "/tools/regex",
    status: "stable",
    keywords: ["regex", "regular expression", "test", "match", "replace", "pattern"],
    iconName: "SearchCode"
  },
  // Add an example of unmigrated tools:
  restApi: {
    id: "restApi",
    name: "REST API Tester",
    category: "API Tools",
    description: "Test HTTP requests",
    route: "/tools/rest-api",
    status: "beta",
    keywords: ["api", "rest", "http", "fetch", "tester", "postman", "client", "request"],
    iconName: "Network"
  }
};
