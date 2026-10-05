const target = 'http://localhost:8000';

/**
 * Angular and the legacy PHP backend intentionally share the same URLs
 * (e.g. /admin/login, /blogs) — Angular's HttpClient calls them as a JSON
 * API, while the browser also needs to navigate to those exact paths to
 * load the Angular pages themselves.
 *
 * We tell them apart using the Accept header: Angular's own ApiService /
 * PublicBlogService always send "Accept: application/json". A normal
 * browser navigation (typing the URL, refresh, clicking a link) sends
 * "Accept: text/html...". Non-GET requests (like the login POST) are
 * always real API calls, so those are proxied too regardless of header.
 */
function bypass(req) {
  const accept = req.headers['accept'] || '';
  if (req.method === 'GET' && accept.includes('text/html')) {
    // Not an API call — let Angular's dev server serve its own index.html.
    return '/index.html';
  }
  // undefined return value = proceed with proxying to PHP as normal.
}

const apiProxy = { target, secure: false, changeOrigin: true, bypass };

// app.routes.ts also registers a legacy "*.html" alias for most pages
// (about.html, career-details.html, etc.) for old bookmarked/SEO'd URLs.
// Vite's dev server treats any request with a real file extension as a
// static asset lookup and never falls back to index.html for it, so a
// direct visit/refresh on these 404s with "no asset found" unless we
// route them through the same bypass() used for the API paths above.
const legacyHtmlPages = [
  '/about.html', '/services.html', '/service-details.html',
  '/products.html', '/product-details.html', '/career.html',
  '/career-details.html', '/blog-details.html', '/contact.html'
];

module.exports = {
  '/admin': apiProxy,
  '/admin/': apiProxy,
  '/blogs': apiProxy,
  '/blogs/': apiProxy,
  '/blog/': apiProxy,
  '/search': apiProxy,
  '/tag/': apiProxy,
  ...Object.fromEntries(legacyHtmlPages.map(p => [p, apiProxy])),
  // Uploaded blog banner images live only on the PHP side — always proxy,
  // there's no Angular route named "/images/..." to collide with.
  '/images/': { target, secure: false, changeOrigin: true }
};