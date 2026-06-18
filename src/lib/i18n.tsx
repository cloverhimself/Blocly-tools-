import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "es" | "fr" | "pt" | "ar" | "hi" | "zh";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
];

const RTL = new Set<Lang>(["ar"]);

// Translations for the app shell (hero, nav, footer, search). Tool pages stay in
// English for now; this is the foundation a fuller translation builds on.
type Keys =
  | "heroA" | "heroB" | "heroSub" | "search" | "found" | "toolsCount"
  | "navTools" | "navShare" | "navGuide" | "navInstall" | "navFollow"
  | "footerDesc" | "footerToolkit" | "recommended";

const dict: Record<Lang, Record<Keys, string>> = {
  en: {
    heroA: "A unified digital", heroB: "toolkit",
    heroSub: "A fast, private platform of free tools for everyday work. No sign-up, and most tools run right in your browser.",
    search: "Search {n} tools - try 'pdf', 'mp3' or 'jwt'", found: "{n} found", toolsCount: "{n} tools",
    navTools: "Tools", navShare: "Share", navGuide: "Guide", navInstall: "Install App", navFollow: "Follow",
    footerDesc: "A unified productivity platform where every tool feels identical in interaction, reliability and structure. Fast, reliable utilities for everyone.",
    footerToolkit: "A unified digital toolkit", recommended: "Recommended & Popular Tools",
  },
  es: {
    heroA: "Un kit de herramientas", heroB: "digital",
    heroSub: "Una plataforma rápida y privada de herramientas gratuitas para el trabajo diario. Sin registro, y la mayoría funciona en tu navegador.",
    search: "Busca entre {n} herramientas - prueba 'pdf', 'mp3' o 'jwt'", found: "{n} encontradas", toolsCount: "{n} herramientas",
    navTools: "Herramientas", navShare: "Compartir", navGuide: "Guía", navInstall: "Instalar app", navFollow: "Seguir",
    footerDesc: "Una plataforma de productividad unificada donde cada herramienta se siente igual en interacción, fiabilidad y estructura.",
    footerToolkit: "Un kit de herramientas digital", recommended: "Herramientas recomendadas y populares",
  },
  fr: {
    heroA: "Une boîte à outils", heroB: "numérique",
    heroSub: "Une plateforme rapide et privée d'outils gratuits pour le travail quotidien. Sans inscription, et la plupart fonctionnent dans votre navigateur.",
    search: "Rechercher parmi {n} outils - essayez 'pdf', 'mp3' ou 'jwt'", found: "{n} trouvés", toolsCount: "{n} outils",
    navTools: "Outils", navShare: "Partager", navGuide: "Guide", navInstall: "Installer", navFollow: "Suivre",
    footerDesc: "Une plateforme de productivité unifiée où chaque outil offre la même interaction, fiabilité et structure.",
    footerToolkit: "Une boîte à outils numérique", recommended: "Outils recommandés et populaires",
  },
  pt: {
    heroA: "Um kit de ferramentas", heroB: "digital",
    heroSub: "Uma plataforma rápida e privada de ferramentas gratuitas para o trabalho diário. Sem cadastro, e a maioria funciona no seu navegador.",
    search: "Pesquisar entre {n} ferramentas - tente 'pdf', 'mp3' ou 'jwt'", found: "{n} encontradas", toolsCount: "{n} ferramentas",
    navTools: "Ferramentas", navShare: "Compartilhar", navGuide: "Guia", navInstall: "Instalar app", navFollow: "Seguir",
    footerDesc: "Uma plataforma de produtividade unificada onde cada ferramenta tem a mesma interação, confiabilidade e estrutura.",
    footerToolkit: "Um kit de ferramentas digital", recommended: "Ferramentas recomendadas e populares",
  },
  ar: {
    heroA: "مجموعة أدوات", heroB: "رقمية",
    heroSub: "منصة سريعة وخاصة من الأدوات المجانية للعمل اليومي. بدون تسجيل، ومعظم الأدوات تعمل داخل متصفحك.",
    search: "ابحث في {n} أداة - جرّب 'pdf' أو 'mp3' أو 'jwt'", found: "{n} نتيجة", toolsCount: "{n} أداة",
    navTools: "الأدوات", navShare: "مشاركة", navGuide: "دليل", navInstall: "تثبيت التطبيق", navFollow: "متابعة",
    footerDesc: "منصة إنتاجية موحّدة حيث تتشابه كل أداة في التفاعل والموثوقية والبنية. أدوات سريعة وموثوقة للجميع.",
    footerToolkit: "مجموعة أدوات رقمية", recommended: "الأدوات الموصى بها والشائعة",
  },
  hi: {
    heroA: "एक एकीकृत डिजिटल", heroB: "टूलकिट",
    heroSub: "रोज़मर्रा के काम के लिए मुफ़्त टूल्स का एक तेज़ और निजी प्लेटफ़ॉर्म। कोई साइन-अप नहीं, और ज़्यादातर टूल आपके ब्राउज़र में ही चलते हैं।",
    search: "{n} टूल्स खोजें - 'pdf', 'mp3' या 'jwt' आज़माएँ", found: "{n} मिले", toolsCount: "{n} टूल्स",
    navTools: "टूल्स", navShare: "शेयर", navGuide: "गाइड", navInstall: "ऐप इंस्टॉल करें", navFollow: "फ़ॉलो",
    footerDesc: "एक एकीकृत उत्पादकता प्लेटफ़ॉर्म जहाँ हर टूल इंटरैक्शन, विश्वसनीयता और संरचना में एक जैसा लगता है।",
    footerToolkit: "एक एकीकृत डिजिटल टूलकिट", recommended: "अनुशंसित और लोकप्रिय टूल्स",
  },
  zh: {
    heroA: "统一的数字", heroB: "工具箱",
    heroSub: "一个快速、私密的免费工具平台，适用于日常工作。无需注册，大多数工具直接在浏览器中运行。",
    search: "搜索 {n} 个工具 - 试试 'pdf'、'mp3' 或 'jwt'", found: "找到 {n} 个", toolsCount: "{n} 个工具",
    navTools: "工具", navShare: "分享", navGuide: "指南", navInstall: "安装应用", navFollow: "关注",
    footerDesc: "一个统一的生产力平台，每个工具在交互、可靠性和结构上都保持一致。为每个人提供快速可靠的实用工具。",
    footerToolkit: "统一的数字工具箱", recommended: "推荐与热门工具",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Keys, vars?: Record<string, string | number>) => string };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof localStorage !== "undefined" ? (localStorage.getItem("lang") as Lang) : null;
    if (saved && dict[saved]) return saved;
    const nav = typeof navigator !== "undefined" ? (navigator.language.slice(0, 2) as Lang) : "en";
    return dict[nav] ? nav : "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  };

  const t = (k: Keys, vars?: Record<string, string | number>) => {
    let s = dict[lang][k] ?? dict.en[k] ?? k;
    if (vars) for (const [key, val] of Object.entries(vars)) s = s.replace(`{${key}}`, String(val));
    return s;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
