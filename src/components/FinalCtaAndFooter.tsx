import { Mail, MapPin, Phone } from 'lucide-react';
import { GrowviaLogo } from './GrowviaLogo';
import { COMPANY_CONTACT, ONTARIO_CITIES_COL1, ONTARIO_CITIES_COL2 } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { KineticHeading, MagneticButton } from './MotionPrimitives';
import { navigateToRoute } from '../utils/navigation';

interface FinalCtaAndFooterProps {
  onOpenQuote: () => void;
}

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
];

export function FinalCtaAndFooter({ onOpenQuote }: FinalCtaAndFooterProps) {
  const { t } = useLocale();

  return (
    <>
      {/* 10. FINAL CTA */}
      <section
        className="relative z-10 py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto"
        aria-labelledby="cta-heading"
      >
        <div
          className="rounded-[36px] sm:rounded-[40px] bg-[var(--sage-tint)] backdrop-blur-xl border border-[var(--border)] px-6 py-14 sm:px-12 sm:py-20 text-center card-gloss relative overflow-hidden"
          style={{
            backgroundImage: 'var(--cta-wash)',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-70"
            style={{
              background:
                'linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.6) 40%, rgba(242,107,29,0.35) 65%, transparent 92%)',
            }}
          />
          <p className="eyebrow">{t.ctaAndFooter.ctaEyebrow}</p>
          <KineticHeading
            id="cta-heading"
            className="mt-4 text-[clamp(2.2rem,4.4vw,3.75rem)] leading-[1.06] font-extrabold text-[var(--ink)] max-w-[20ch] mx-auto"
            segments={[
              { text: t.ctaAndFooter.ctaHeadingLead },
              { text: t.ctaAndFooter.ctaHeadingHighlight, highlight: true },
            ]}
          />
          <p className="mt-5 max-w-[54ch] mx-auto text-[18px] leading-[1.6] text-[var(--muted)]">
            {t.ctaAndFooter.ctaBody}
          </p>

          <div className="mt-8 flex justify-center">
            <MagneticButton
              type="button"
              onClick={onOpenQuote}
              className="btn-orange px-10 py-4.5 text-[18px]"
            >
              {t.ctaAndFooter.ctaButton}
            </MagneticButton>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-4 py-1.5 text-[14px] font-medium text-[var(--ink)] hover:border-[#F26B1D] transition-colors whitespace-nowrap"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="relative z-10 mt-8 border-t border-[var(--border)] pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.75fr_1.45fr_1.35fr] gap-8 xl:gap-10">
          {/* Column 1: Logo + 1-line description */}
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateToRoute('/');
              }}
              aria-label={t.ctaAndFooter.backToTopAria}
            >
              <GrowviaLogo />
            </a>
            <p className="mt-4 text-[15.5px] leading-[1.55] text-[var(--muted)] max-w-[30ch]">
              {t.ctaAndFooter.footerTagline}
            </p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {t.ctaAndFooter.servicesColTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-[15px] text-[var(--muted)]">
              <li>
                <a
                  href="/social-media-advertising"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/social-media-advertising');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.servicesLinks.meta}
                </a>
              </li>
              <li>
                <a
                  href="/google-ads-management"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/google-ads-management');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.servicesLinks.google}
                </a>
              </li>
              <li>
                <a
                  href="/content-creation"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/content-creation');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.servicesLinks.content}
                </a>
              </li>
              <li>
                <a
                  href="/website-design"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/website-design');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.servicesLinks.website}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {t.ctaAndFooter.companyColTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-[15px] text-[var(--muted)]">
              <li>
                <a
                  href="/industries"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/industries');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.companyLinks.industries}
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/about');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.companyLinks.about}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/contact');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.companyLinks.contact}
                </a>
              </li>
              <li>
                <a
                  href="/#work"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/#work');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.companyLinks.work}
                </a>
              </li>
              <li>
                <a
                  href="/#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToRoute('/#faq');
                  }}
                  className="hover:text-[#F26B1D] transition-colors"
                >
                  {t.ctaAndFooter.companyLinks.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Dedicated Contact Section */}
          <section aria-labelledby="footer-contact-heading">
            <h3
              id="footer-contact-heading"
              className="text-[14px] font-bold uppercase tracking-wider text-[var(--ink)]"
            >
              {t.ctaAndFooter.contactColTitle}
            </h3>
            <address className="mt-4 not-italic space-y-3 text-[15px]">
              <a
                href={COMPANY_CONTACT.mailtoHref}
                className="group flex items-center gap-3 rounded-[16px] bg-[var(--surface)]/80 border border-[var(--border)] px-3.5 py-2.5 text-[var(--ink)] hover:border-[#F26B1D] transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center justify-center text-[#2E6B45] dark:text-[#9BC094] group-hover:text-[#F26B1D] transition-colors shrink-0"
                >
                  <Mail className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {t.ctaAndFooter.emailLabel}
                  </span>
                  <span className="block font-semibold text-[14.5px] group-hover:text-[#F26B1D] transition-colors break-all">
                    {COMPANY_CONTACT.email}
                  </span>
                </span>
              </a>

              <a
                href={COMPANY_CONTACT.phoneHref}
                className="group flex items-center gap-3 rounded-[16px] bg-[var(--surface)]/80 border border-[var(--border)] px-3.5 py-2.5 text-[var(--ink)] hover:border-[#F26B1D] transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center justify-center text-[#2E6B45] dark:text-[#9BC094] group-hover:text-[#F26B1D] transition-colors shrink-0"
                >
                  <Phone className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {t.ctaAndFooter.phoneLabel}
                  </span>
                  <span className="block font-semibold text-[14.5px] tabular-nums group-hover:text-[#F26B1D] transition-colors">
                    {COMPANY_CONTACT.phoneDisplay}
                  </span>
                </span>
              </a>

              <p className="flex items-center gap-2 pt-1 text-[13.5px] text-[var(--muted)]">
                <MapPin className="w-4 h-4 text-[#F26B1D] shrink-0" aria-hidden="true" />
                <span>{t.ctaAndFooter.areaBadge}</span>
              </p>
            </address>
          </section>

          {/* Column 5: Service areas (Ontario cities in 2 columns) */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {t.ctaAndFooter.serviceAreasTitle}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5 text-[15px] text-[var(--muted)]">
              <ul className="space-y-2.5">
                {ONTARIO_CITIES_COL1.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
              <ul className="space-y-2.5">
                {ONTARIO_CITIES_COL2.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 sm:pr-20 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[14px] text-[var(--muted)]">
          <p>{t.ctaAndFooter.copyright}</p>
          <p>{t.ctaAndFooter.servingCanada}</p>
        </div>
      </footer>
    </>
  );
}
