import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // List all locales that are supported
  locales: ['en', 'de'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|de)/:path*']
};
