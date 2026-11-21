import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OG_IMAGE_URL,
  SEO_PAGES,
  SEO_ROUTE_PATHS,
  SITE_ORIGIN,
  buildBreadcrumbTrail,
  buildCanonicalUrl,
  buildJsonLdGraph,
  buildLocalizedBreadcrumbTrail,
  buildRobotsTxt,
  buildSitemapXml,
  injectSeoIntoHtml,
  normalizeSeoRoute,
} from './seoConfig';

test('normalizeSeoRoute resolves known canonical paths and returns null for unknown paths', () => {
  assert.equal(normalizeSeoRoute('/'), '/');
  assert.equal(normalizeSeoRoute(''), '/');
  assert.equal(normalizeSeoRoute('/google-ads-management/'), '/google-ads-management');
  assert.equal(normalizeSeoRoute('/industries?ref=nav#hvac'), '/industries');
  assert.equal(normalizeSeoRoute('/non-existent-page'), null);
});

test('all 8 SEO routes have unique titles (30-60 chars) and meta descriptions (120-160 chars)', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const path of SEO_ROUTE_PATHS) {
    const meta = SEO_PAGES[path];
    assert.ok(
      meta.title.length >= 30 && meta.title.length <= 60,
      `${path} title length ${meta.title.length} outside 30-60: "${meta.title}"`
    );
    assert.ok(
      meta.description.length >= 120 && meta.description.length <= 160,
      `${path} description length ${meta.description.length} outside 120-160: "${meta.description}"`
    );
    assert.ok(!titles.has(meta.title), `Duplicate title detected for ${path}`);
    assert.ok(!descriptions.has(meta.description), `Duplicate description detected for ${path}`);
    titles.add(meta.title);
    descriptions.add(meta.description);
  }
});

test('buildSitemapXml and buildRobotsTxt include all 8 canonical growvia.ca URLs', () => {
  const sitemap = buildSitemapXml();
  for (const path of SEO_ROUTE_PATHS) {
    const expectedLoc = `<loc>${buildCanonicalUrl(path)}</loc>`;
    assert.ok(sitemap.includes(expectedLoc), `Sitemap missing ${expectedLoc}`);
  }
  assert.ok(!sitemap.includes('non-existent'));

  const robots = buildRobotsTxt();
  assert.ok(robots.includes('Allow: /'));
  assert.ok(robots.includes('Disallow: /api/'));
  assert.ok(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
  assert.equal(OG_IMAGE_URL, `${SITE_ORIGIN}/growvia-digital-marketing-agency-og.jpg`);
});

test('buildBreadcrumbTrail returns Home -> Page trail with 1-based positions for every SEO subpage', () => {
  for (const path of SEO_ROUTE_PATHS) {
    const trail = buildBreadcrumbTrail(path);
    assert.equal(trail[0].name, 'Home');
    assert.equal(trail[0].path, '/');
    assert.equal(trail[0].position, 1);
    assert.equal(trail[0].url, `${SITE_ORIGIN}/`);
    if (path === '/') {
      assert.equal(trail.length, 1);
      assert.equal(trail[0].isCurrent, true);
    } else {
      assert.equal(trail.length, 2);
      assert.equal(trail[0].isCurrent, false);
      assert.equal(trail[1].path, path);
      assert.equal(trail[1].position, 2);
      assert.equal(trail[1].url, buildCanonicalUrl(path));
      assert.equal(trail[1].isCurrent, true);
    }
  }
});

test('buildLocalizedBreadcrumbTrail supports EN/FR overrides and 404 fallback paths', () => {
  const frTrail = buildLocalizedBreadcrumbTrail('/google-ads-management', {
    homeLabel: 'Accueil',
    currentLabel: 'Gestion Google Ads',
  });
  assert.deepEqual(frTrail, [
    {
      name: 'Accueil',
      path: '/',
      url: 'https://growvia.ca/',
      position: 1,
      isCurrent: false,
    },
    {
      name: 'Gestion Google Ads',
      path: '/google-ads-management',
      url: 'https://growvia.ca/google-ads-management',
      position: 2,
      isCurrent: true,
    },
  ]);

  const notFoundTrail = buildLocalizedBreadcrumbTrail(null, {
    homeLabel: 'Accueil',
    notFoundLabel: 'Page introuvable',
  });
  assert.deepEqual(notFoundTrail, [
    {
      name: 'Accueil',
      path: '/',
      url: 'https://growvia.ca/',
      position: 1,
      isCurrent: false,
    },
    {
      name: 'Page introuvable',
      path: null,
      url: null,
      position: 2,
      isCurrent: true,
    },
  ]);
});

test('buildJsonLdGraph emits valid Organization, Service, Breadcrumb & FAQ schemas without fabricated addresses', () => {
  const homeGraph = JSON.stringify(buildJsonLdGraph('/'));
  assert.ok(homeGraph.includes('"Organization"'));
  assert.ok(homeGraph.includes('"ProfessionalService"'));
  assert.ok(homeGraph.includes('"FAQPage"'));
  assert.ok(homeGraph.includes('growviacanada@gmail.com'));
  assert.ok(homeGraph.includes('+1-604-722-6760'));
  assert.ok(!homeGraph.includes('"streetAddress"'));

  const adsGraph = JSON.stringify(buildJsonLdGraph('/google-ads-management'));
  assert.ok(adsGraph.includes('"Service"'));
  assert.ok(adsGraph.includes('"BreadcrumbList"'));
  assert.ok(adsGraph.includes('https://growvia.ca/google-ads-management'));
});

test('injectSeoIntoHtml injects per-route metadata for valid routes and noindex for unknown routes', () => {
  const shellHtml = `<!doctype html>
<html>
  <head>
    <title>Default</title>
    <meta name="description" content="Default desc" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://growvia.ca/" />
    <meta property="og:title" content="Default" />
    <meta property="og:description" content="Default desc" />
    <meta property="og:url" content="https://growvia.ca/" />
    <meta name="twitter:title" content="Default" />
    <meta name="twitter:description" content="Default desc" />
  </head>
  <body><div id="root"></div></body>
</html>`;

  const webHtml = injectSeoIntoHtml(shellHtml, '/website-design');
  const escapedWebTitle = SEO_PAGES['/website-design'].title.replaceAll('&', '&amp;');
  assert.ok(webHtml.includes(`<title>${escapedWebTitle}</title>`));
  assert.ok(webHtml.includes('href="https://growvia.ca/website-design"'));
  assert.ok(webHtml.includes('content="index, follow"'));
  assert.ok(webHtml.includes('id="growvia-seo-schema"'));

  const unknownHtml = injectSeoIntoHtml(shellHtml, '/does-not-exist');
  assert.ok(unknownHtml.includes('content="noindex, follow"'));
});
