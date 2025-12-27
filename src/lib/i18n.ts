export const SUPPORTED_LOCALES = ['en', 'ja', 'zh'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function getLocaleFromPathname(pathname: string): Locale {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function ensureLeadingSlash(pathname: string): string {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function ensureTrailingSlash(pathname: string): string {
  if (!pathname) return '/';
  if (pathname.endsWith('/')) return pathname;
  return `${pathname}/`;
}

export function stripLocaleFromPathname(pathname: string): string {
  const normalized = ensureLeadingSlash(pathname);
  const locale = getLocaleFromPathname(normalized);

  if (locale === DEFAULT_LOCALE) {
    return ensureTrailingSlash(normalized);
  }

  const prefix = `/${locale}`;
  const stripped = normalized === prefix ? '/' : normalized.replace(new RegExp(`^/${locale}(?=/|$)`), '');
  return ensureTrailingSlash(stripped || '/');
}

export function localizePathname(pathname: string, locale?: Locale): string {
  const basePath = stripLocaleFromPathname(pathname);

  const resolvedLocale: Locale =
    locale ??
    (typeof window !== 'undefined' ? getLocaleFromPathname(window.location.pathname) : DEFAULT_LOCALE);

  if (resolvedLocale === DEFAULT_LOCALE) {
    return ensureTrailingSlash(basePath);
  }

  const prefixed = basePath === '/' ? `/${resolvedLocale}` : `/${resolvedLocale}${basePath}`;
  return ensureTrailingSlash(prefixed);
}

export function getHtmlLang(locale: Locale): string {
  switch (locale) {
    case 'ja':
      return 'ja';
    case 'zh':
      return 'zh-Hans';
    case 'en':
    default:
      return 'en';
  }
}

export function getOgLocale(locale: Locale): string {
  switch (locale) {
    case 'ja':
      return 'ja_JP';
    case 'zh':
      return 'zh_CN';
    case 'en':
    default:
      return 'en_US';
  }
}

export function getHreflang(locale: Locale): string {
  switch (locale) {
    case 'ja':
      return 'ja';
    case 'zh':
      return 'zh-Hans';
    case 'en':
    default:
      return 'en';
  }
}




