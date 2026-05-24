import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { GLOBAL } from "./constants";
import { routing } from "./i18n/routing";
import { normalizeLanguageCode } from "./utils/language";

const handleI18nRouting = createMiddleware(routing);

// Handle URL lang parameter redirection
function handleLangParam(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const langParam = searchParams.get("lang");

  if (!langParam) {
    return null;
  }

  const normalizedLang = normalizeLanguageCode(langParam);
  if (!GLOBAL.LOCALE.SUPPORTED.includes(normalizedLang)) {
    return null;
  }

  const newUrl = new URL(request.url);
  searchParams.delete("lang");

  let newPathname = pathname;
  if (pathname === "/") {
    newPathname = `/${normalizedLang}`;
  } else if (!pathname.startsWith(`/${normalizedLang}`)) {
    const localeRegex = new RegExp(`^/(${GLOBAL.LOCALE.SUPPORTED.join("|")})`);
    if (localeRegex.test(pathname)) {
      newPathname = pathname.replace(localeRegex, `/${normalizedLang}`);
    } else {
      newPathname = `/${normalizedLang}${pathname}`;
    }
  }

  newUrl.pathname = newPathname;
  newUrl.search = searchParams.toString();
  return NextResponse.redirect(newUrl);
}

export default function middleware(request: NextRequest) {
  const legacyClientApi = [
    "/api/gen-english-card",
    "/api/gen-image",
    "/api/gen-img",
    "/api/gen-img-with-img",
    "/api/gen-style-reference-image",
    "/api/image-to-video",
    "/api/text-to-image",
    "/api/translate",
    "/api/video-poll",
  ];

  if (
    legacyClientApi.some((path) => request.nextUrl.pathname.startsWith(path)) &&
    process.env.ALLOW_LEGACY_CLIENT_API !== "true"
  ) {
    return NextResponse.json(
      {
        error:
          "Legacy client-key API is disabled. Use the authenticated SaaS generation endpoints.",
      },
      { status: 410 }
    );
  }

  // First handle lang parameter if present
  const langRedirect = handleLangParam(request);
  if (langRedirect) return langRedirect;

  // Then handle regular i18n routing
  const shouldHandle = new RegExp(
    `^/(${GLOBAL.LOCALE.SUPPORTED.join("|")})(/.*)?$`
  ).test(request.nextUrl.pathname);

  if (!shouldHandle) return;

  return handleI18nRouting(request);
}
