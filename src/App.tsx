import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { X } from 'lucide-react';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CampaignStrip } from './components/CampaignStrip';
import { ServicesSection } from './components/ServicesSection';
import { ResultsSection } from './components/ResultsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { WebsitesSection } from './components/WebsitesSection';
import { AiGrowthLab } from './components/AiGrowthLab';
import { DifferenceSection } from './components/DifferenceSection';
import { FaqSection } from './components/FaqSection';
import { FinalCtaAndFooter } from './components/FinalCtaAndFooter';
import { ScrollTreeWidget } from './components/ScrollTreeWidget';
import { QuoteModal } from './components/QuoteModal';
import { SeoSubpageView } from './components/SeoSubpageView';
import { CursorAmbientHalo, ScrollAmbientFields } from './components/MotionPrimitives';
import { trapFocusOnKeyDown } from './utils/focusTrap';
import { applyClientSeoHead, useAppPathname } from './utils/navigation';
import { normalizeSeoRoute } from './utils/seoConfig';
import type { CampaignTile } from './data/agencyData';
import type { ServiceOption } from './utils/quoteLogic';

function AppShell() {
  const { t } = useLocale();
  const pathname = useAppPathname();
  const normalizedRoute = normalizeSeoRoute(pathname);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<ServiceOption | null>(null);
  const [preselectedServices, setPreselectedServices] = useState<ServiceOption[]>([]);
  const [prefillBusinessName, setPrefillBusinessName] = useState('');
  const [prefillIndustry, setPrefillIndustry] = useState('');
  const [prefillNotes, setPrefillNotes] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const selectedCampaign =
    selectedCampaignId
      ? t.campaigns.tiles.find((tile) => tile.id === selectedCampaignId) ?? null
      : null;

  useEffect(() => {
    applyClientSeoHead(pathname);
  }, [pathname]);

  const campaignModalRef = useRef<HTMLDivElement>(null);
  const campaignTriggerRef = useRef<HTMLElement | null>(null);
  const campaignCloseRef = useRef<HTMLButtonElement>(null);

  const openQuoteModal = (service: ServiceOption | null = null) => {
    setSelectedCampaignId(null);
    setPreselectedService(service);
    setPreselectedServices([]);
    setPrefillBusinessName('');
    setPrefillIndustry('');
    setPrefillNotes('');
    setQuoteOpen(true);
  };

  const openQuoteWithAiPlan = (payload: {
    services: ServiceOption[];
    businessName: string;
    industry: string;
    notes?: string;
  }) => {
    setSelectedCampaignId(null);
    setPreselectedService(null);
    setPreselectedServices(payload.services);
    setPrefillBusinessName(payload.businessName);
    setPrefillIndustry(payload.industry);
    setPrefillNotes(payload.notes ?? '');
    setQuoteOpen(true);
  };

  const handleOpenCampaign = (tile: CampaignTile) => {
    campaignTriggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedCampaignId(tile.id);
  };

  const handleCloseCampaign = () => {
    setSelectedCampaignId(null);
    const trigger = campaignTriggerRef.current;
    campaignTriggerRef.current = null;
    window.setTimeout(() => {
      trigger?.focus();
    }, 0);
  };

  useEffect(() => {
    if (!selectedCampaignId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      campaignCloseRef.current?.focus();
    }, 15);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseCampaign();
      } else if (e.key === 'Tab') {
        trapFocusOnKeyDown(e, campaignModalRef.current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedCampaignId]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] relative overflow-x-clip">
        <ScrollAmbientFields />
        <CursorAmbientHalo />

        {/* 1. Floating Pill Navigation */}
        <Navbar onOpenQuote={() => openQuoteModal(null)} />

        <main className="relative z-10">
          {normalizedRoute === '/' ? (
            <>
              {/* 2. Hero with Botanical Tree & Floating Service Cards */}
              <HeroSection
                onOpenQuote={() => openQuoteModal(null)}
                onSelectService={(svc) => openQuoteModal(svc)}
              />

              {/* 3. Campaign Strip Marquee */}
              <CampaignStrip onSelectCampaign={handleOpenCampaign} />

              {/* 4. Sticky Stacking Services */}
              <ServicesSection onOpenQuoteWithService={(svc) => openQuoteModal(svc)} />

              {/* 5. Client Results */}
              <ResultsSection />

              {/* 6. Client Reviews (Dual Marquee) */}
              <ReviewsSection />

              {/* 7. Websites Showcase */}
              <WebsitesSection onOpenWebsiteQuote={() => openQuoteModal('Website')} />

              {/* AI Growth Lab (Blueprint, Voiceover TTS, Grounded Audit, Voice Brief, Streaming Advisor) */}
              <AiGrowthLab onApplyPlanToQuote={openQuoteWithAiPlan} />

              {/* 8. Our Difference & Team */}
              <DifferenceSection />

              {/* 9. FAQ Accordion */}
              <FaqSection />
            </>
          ) : (
            <SeoSubpageView
              routePath={normalizedRoute}
              onOpenQuote={(svc) => openQuoteModal(svc ?? null)}
            />
          )}

          {/* 10. Final CTA + 11. Footer */}
          <FinalCtaAndFooter onOpenQuote={() => openQuoteModal(null)} />
        </main>

        {/* Scroll-Driven Mini Tree Progress Card */}
        <ScrollTreeWidget />

        {/* Interactive Campaign Tile Preview Modal */}
        {selectedCampaign && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1F16]/70 backdrop-blur-sm"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseCampaign();
            }}
          >
            <div
              ref={campaignModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="campaign-preview-title"
              className="w-full max-w-[540px] rounded-[32px] glass-panel border border-[var(--border)] p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{t.campaigns.modalEyebrow}</p>
                  <h2
                    id="campaign-preview-title"
                    className="mt-2 text-[1.45rem] sm:text-[1.6rem] font-extrabold text-[var(--ink)] leading-tight"
                  >
                    {selectedCampaign.industry} — {selectedCampaign.type}
                  </h2>
                </div>
                <button
                  ref={campaignCloseRef}
                  type="button"
                  onClick={handleCloseCampaign}
                  aria-label={t.campaigns.closeAria}
                  className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--ink)] flex items-center justify-center hover:bg-[#F26B1D] hover:text-[#1A2E20] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div
                className="mt-5 rounded-[24px] p-5 flex flex-col justify-between gap-3 text-[#EEF0E4] border border-white/15 relative overflow-hidden"
                style={{ background: selectedCampaign.gradient }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FFFDF8]">
                    {t.quoteModal.serviceLabels[selectedCampaign.serviceTag]} · {selectedCampaign.metricBadge}
                  </span>
                  <span className="text-[12.5px] font-medium text-[#E3EAD9]/90">
                    {selectedCampaign.targetFormat}
                  </span>
                </div>
                <p className="text-[14px] text-[#E3EAD9]/95 leading-relaxed">
                  {selectedCampaign.campaignNote}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-[20px] bg-[var(--bg)] border border-[var(--border)] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#F26B1D]">
                    {t.campaigns.adAngleLabel}
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-[var(--ink)] leading-relaxed">
                    {selectedCampaign.adAngle}
                  </p>
                </div>

                <div className="rounded-[20px] bg-[var(--bg)] border border-[var(--border)] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    {t.campaigns.creativeBriefLabel}
                  </p>
                  <p className="mt-1 text-[15px] text-[var(--muted)] leading-relaxed">
                    {selectedCampaign.creativeBrief}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                    {t.campaigns.deliverablesLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.deliverables.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-3 py-1 text-[13px] font-medium text-[var(--ink)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleCloseCampaign}
                  className="btn-outline px-5 py-2.5 text-[14.5px]"
                >
                  {t.campaigns.closeBtn}
                </button>
                <button
                  type="button"
                  onClick={() => openQuoteModal(selectedCampaign.serviceTag)}
                  className="btn-orange px-6 py-2.5 text-[14.5px]"
                >
                  {t.campaigns.quoteForPrefix} {t.quoteModal.serviceLabels[selectedCampaign.serviceTag]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5-Step Quote Popup */}
        <QuoteModal
          isOpen={quoteOpen}
          preselectedService={preselectedService}
          preselectedServices={preselectedServices}
          prefillBusinessName={prefillBusinessName}
          prefillIndustry={prefillIndustry}
          prefillNotes={prefillNotes}
          onClose={() => setQuoteOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <AppShell />
    </LocaleProvider>
  );
}
