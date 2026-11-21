import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  LOCALE_STORAGE_KEY,
  MESSAGES,
  getOppositeLocale,
  resolveInitialLocale,
} from '../utils/i18n';
import type { Locale, SiteMessages } from '../utils/i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: SiteMessages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitialBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    stored = null;
  }
  return resolveInitialLocale({
    search: window.location.search,
    stored,
    navigatorLanguage: window.navigator?.language ?? '',
  });
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readInitialBrowserLocale());

  const persistLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        // Ignore storage quota / privacy mode restrictions
      }
      if (window.location.search.includes('lang=')) {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', next);
        window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = getOppositeLocale(prev);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        } catch {
          // Ignore storage restrictions
        }
        if (window.location.search.includes('lang=')) {
          const url = new URL(window.location.href);
          url.searchParams.set('lang', next);
          window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: persistLocale,
      toggleLocale,
      t: MESSAGES[locale],
    }),
    [locale, persistLocale, toggleLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: 'en',
      setLocale: () => {},
      toggleLocale: () => {},
      t: MESSAGES.en,
    };
  }
  return ctx;
}
