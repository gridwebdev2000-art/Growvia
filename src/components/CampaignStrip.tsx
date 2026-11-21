import { Play } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import type { CampaignTile } from '../data/agencyData';

interface CampaignStripProps {
  onSelectCampaign: (tile: CampaignTile) => void;
}

export function CampaignStrip({ onSelectCampaign }: CampaignStripProps) {
  const { t } = useLocale();

  return (
    <section
      id="work"
      className="relative z-10 py-10 sm:py-14 scroll-mt-24"
      aria-label={t.campaigns.regionAria}
    >
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-6">
        <p className="text-[16px] sm:text-[17px] font-bold text-[var(--ink)] tracking-tight">
          {t.campaigns.heading}
        </p>
        <div className="inline-flex items-center gap-2.5 text-[14px] font-medium text-[var(--muted)]">
          <span>{t.campaigns.scrollCue}</span>
          <span className="inline-block w-5 h-[2px] rounded-full bg-[#F26B1D]" aria-hidden="true" />
        </div>
      </div>

      <div className="marquee-container marquee-mask overflow-hidden py-2">
        <div className="marquee-track-left gap-4 sm:gap-5 px-2">
          {/* Primary accessible list */}
          {t.campaigns.tiles.map((tile) => (
            <CampaignCard key={tile.id} tile={tile} onSelect={onSelectCampaign} />
          ))}
          {/* Duplicate track for seamless infinite loop */}
          {t.campaigns.tiles.map((tile) => (
            <CampaignCard
              key={`${tile.id}-dup`}
              tile={tile}
              onSelect={onSelectCampaign}
              isDuplicate
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CampaignCardProps {
  tile: CampaignTile;
  onSelect: (tile: CampaignTile) => void;
  isDuplicate?: boolean;
}

function CampaignCard({ tile, onSelect, isDuplicate = false }: CampaignCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tile)}
      tabIndex={isDuplicate ? -1 : 0}
      aria-hidden={isDuplicate || undefined}
      aria-label={isDuplicate ? undefined : `${tile.industry} — ${tile.type}`}
      className="shine-card w-[200px] sm:w-[224px] h-[278px] sm:h-[305px] shrink-0 rounded-[28px] p-4 sm:p-5 flex flex-col justify-between text-left relative overflow-hidden group transition-all duration-200 hover:-translate-y-2 border border-white/20 cursor-pointer"
      style={{
        background: tile.gradient,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.28), 0 18px 34px -18px rgba(23, 48, 31, 0.55)',
      }}
    >
      {/* Subtle studio top-left specular flare */}
      <div
        className="absolute -top-10 -left-10 w-36 h-36 rounded-full pointer-events-none opacity-45"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle botanical ring pattern */}
      <svg
        viewBox="0 0 190 270"
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <circle cx="148" cy="64" r="68" stroke="#E3EAD9" strokeWidth="1.2" fill="none" />
        <circle cx="42" cy="180" r="82" stroke="#A9BFA3" strokeWidth="1" fill="none" />
      </svg>

      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wider uppercase text-[#EEF0E4]/90">
          {tile.metricBadge}
        </span>
        <span className="w-9 h-9 rounded-full bg-white text-[#17301F] flex items-center justify-center shadow-md ring-2 ring-transparent group-hover:ring-[#F26B1D] transition-all duration-200 group-hover:scale-105">
          <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" aria-hidden="true" />
        </span>
      </div>

      <div className="relative z-10 mt-auto">
        <p className="font-display font-bold text-[16px] leading-snug text-[#FFFDF8]">
          {tile.industry}
        </p>
        <p className="text-[13px] text-[#E3EAD9]/90 mt-0.5">{tile.type}</p>
      </div>
    </button>
  );
}
