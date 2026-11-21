import { useEffect, useState } from 'react';
import {
  SEO_PAGES,
  buildCanonicalUrl,
  buildJsonLdGraph,
  normalizeSeoRoute,
} from './seoConfig';

const NAV_EVENT = 'growvia:navigate';

export function getCurrentPathname(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

export function navigateToRoute(targetHref: string): void {
  if (typeof window === 'undefined') return;

  const [rawPath, rawHash] = targetHref.split('#');
  const nextPath = rawPath && rawPath.startsWith('/') ? rawPath : rawPath ? `/${rawPath}` : '/';
  const currentParams = new URLSearchParams(window.location.search);
  const langParam = currentParams.get('lang');
  const searchSuffix = langParam ? `?lang=${encodeURIComponent(langParam)}` : '';
  const nextUrl = rawHash ? `${nextPath}${searchSuffix}#${rawHash}` : `${nextPath}${searchSuffix}`;

  const currentFull = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentFull !== nextUrl) {
    window.history.pushState(null, '', nextUrl);
  }

  window.dispatchEvent(new CustomEvent(NAV_EVENT));

  if (rawHash) {
    window.setTimeout(() => {
      const targetEl = document.getElementById(rawHash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 45);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function useAppPathname(): string {
  const [pathname, setPathname] = useState<string>(() => getCurrentPathname());

  useEffect(() => {
    const sync = () => setPathname(getCurrentPathname());
    window.addEventListener('popstate', sync);
    window.addEventListener(NAV_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(NAV_EVENT, sync);
    };
  }, []);

  return pathname;
}

function setMetaTag(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applyClientSeoHead(pathname: string): void {
  if (typeof document === 'undefined') return;

  const normalized = normalizeSeoRoute(pathname);
  const meta = normalized ? SEO_PAGES[normalized] : SEO_PAGES['/'];
  const canonical = normalized ? buildCanonicalUrl(normalized) : buildCanonicalUrl('/');
  const robots = normalized ? 'index, follow' : 'noindex, follow';

  document.title = meta.title;
  setMetaTag('meta[name="description"]', 'name', 'description', meta.description);
  setMetaTag('meta[name="robots"]', 'name', 'robots', robots);
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', meta.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', meta.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonical);

  let schemaScript = document.head.querySelector<HTMLScriptElement>('#growvia-seo-schema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'growvia-seo-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify(buildJsonLdGraph(normalized ?? '/'));
}
