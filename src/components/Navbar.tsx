import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { GrowviaLogo } from './GrowviaLogo';
import { MagneticButton } from './MotionPrimitives';
import { navigateToRoute } from '../utils/navigation';

interface NavbarProps {
  onOpenQuote: () => void;
}

export function Navbar({ onOpenQuote }: NavbarProps) {
  const { locale, setLocale, t } = useLocale();
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: t.navbar.work, href: '/#work' },
    { label: t.navbar.results, href: '/#results' },
    { label: t.navbar.about, href: '/about' },
    { label: t.navbar.faq, href: '/#faq' },
  ];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setServicesOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setServicesOpen(false);
    navigateToRoute(href);
  };

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-[1480px] mx-auto relative" ref={dropdownRef}>
        <div
          className="pointer-events-auto relative overflow-hidden flex items-center justify-between gap-1.5 sm:gap-4 md:gap-6 rounded-full px-3 sm:px-6 lg:px-7 py-2 sm:py-2.5 border border-[var(--border)] card-gloss"
          style={{
            backgroundColor: 'var(--surface)',
            backgroundImage:
              'linear-gradient(110deg, rgba(255,255,255,0.28) 0%, transparent 45%, rgba(242,107,29,0.06) 100%)',
          }}
        >
          {/* Subtle iridescent specular hairline across the top glass edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-8 right-8 h-[1px]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(169,191,163,0.65), rgba(242,107,29,0.45), rgba(169,191,163,0.65), transparent)',
            }}
          />

          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            aria-label={t.navbar.homeAria}
            className="whitespace-nowrap shrink-0 rounded-full py-0.5"
          >
            <GrowviaLogo />
          </a>

          <nav aria-label={t.navbar.primaryNavAria} className="hidden md:flex items-center gap-6 lg:gap-7">
            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-controls="navbar-services-menu"
              onClick={() => setServicesOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--ink)] hover:text-[#F26B1D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.navbar.servicesButton}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${
                  servicesOpen ? 'rotate-180 text-[#F26B1D]' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--ink)] hover:text-[#F26B1D] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Compact EN / FR Canadian Bilingual Switch */}
            <div
              role="group"
              aria-label={t.navbar.languageGroupAria}
              data-testid="locale-switcher"
              className="inline-flex items-center rounded-full bg-[var(--sage-tint)] border border-[var(--border)] p-0.5 shrink-0"
            >
              <button
                type="button"
                data-testid="locale-btn-en"
                aria-pressed={locale === 'en'}
                aria-label={t.navbar.switchToEnglishAria}
                onClick={() => setLocale('en')}
                className={`rounded-full px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-[12px] font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                  locale === 'en'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                data-testid="locale-btn-fr"
                aria-pressed={locale === 'fr'}
                aria-label={t.navbar.switchToFrenchAria}
                onClick={() => setLocale('fr')}
                className={`rounded-full px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-[12px] font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                  locale === 'fr'
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                FR
              </button>
            </div>

            <MagneticButton
              type="button"
              onClick={onOpenQuote}
              className="btn-orange px-3 py-1.5 sm:px-5 sm:py-2.5 text-[11.5px] sm:text-[15px] whitespace-nowrap"
            >
              <span>{t.navbar.getQuote}</span>
              <ArrowRight className="hidden sm:inline-block w-4 h-4 shrink-0" aria-hidden="true" />
            </MagneticButton>
          </div>
        </div>

        {/* Accessible Services SEO Route Dropdown */}
        {servicesOpen && (
          <div
            id="navbar-services-menu"
            className="pointer-events-auto hidden md:block absolute left-1/2 -translate-x-1/2 mt-2.5 w-[310px] rounded-[24px] bg-[var(--surface)] border border-[var(--border)] p-2.5 shadow-xl"
          >
            <ul className="space-y-1">
              {t.navbar.serviceMenuLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="flex items-center justify-between rounded-[14px] px-3.5 py-2.5 text-[14.5px] font-medium text-[var(--ink)] hover:bg-[var(--sage-tint)] hover:text-[#F26B1D] transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
