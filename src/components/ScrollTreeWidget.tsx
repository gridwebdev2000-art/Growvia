import { useEffect, useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { MINI_TREE_LEAVES, computeScrollTreeState } from '../utils/treeMath';

export function ScrollTreeWidget() {
  const { t } = useLocale();
  const [scrollRatio, setScrollRatio] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setHasScrolled(window.scrollY > 140);
      if (scrollable <= 0) {
        setScrollRatio(0);
        return;
      }
      setScrollRatio(window.scrollY / scrollable);
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const state = computeScrollTreeState(scrollRatio, MINI_TREE_LEAVES.length);
  const trunkLength = 26;
  const trunkOffset = trunkLength * (1 - state.trunkProgress);
  const branchLen = 12;
  const branchOffset = branchLen * (1 - state.branchProgress);

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      data-testid="scroll-tree-widget"
      aria-label={`${t.scrollWidget.ariaPrefix} ${state.percentage}%. ${t.scrollWidget.ariaSuffix}`}
      aria-hidden={!hasScrolled}
      tabIndex={hasScrolled ? 0 : -1}
      title={t.scrollWidget.backToTopTitle}
      className={`fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 rounded-[18px] sm:rounded-[20px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-[var(--shadow-card)] p-1.5 sm:p-2.5 flex flex-col items-center gap-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-[56px] sm:w-[76px] ${
        hasScrolled
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <svg
        viewBox="0 0 64 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-8 h-8 sm:w-11 sm:h-11"
      >
        {/* Ground shadow */}
        <ellipse cx="32" cy="52" rx="16" ry="3" fill="var(--sage)" opacity="0.45" />

        {/* Growing trunk */}
        <line
          x1="32"
          y1="51"
          x2="32"
          y2="25"
          stroke="#6B4A2F"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={trunkLength}
          strokeDashoffset={trunkOffset}
        />

        {/* Growing left & right branches */}
        <line
          x1="32"
          y1="38"
          x2="23"
          y2="31"
          stroke="#6B4A2F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={branchLen}
          strokeDashoffset={branchOffset}
          opacity={state.branchProgress > 0 ? 1 : 0}
        />
        <line
          x1="32"
          y1="35"
          x2="41"
          y2="29"
          stroke="#6B4A2F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={branchLen}
          strokeDashoffset={branchOffset}
          opacity={state.branchProgress > 0 ? 1 : 0}
        />

        {/* Bottom-up leaves */}
        {MINI_TREE_LEAVES.map((leaf, index) => {
          const isVisible = index < state.visibleLeafCount;
          return (
            <circle
              key={leaf.id}
              cx={leaf.cx}
              cy={leaf.cy}
              r={leaf.r}
              fill={leaf.color}
              style={{
                transform: isVisible ? 'scale(1)' : 'scale(0)',
                opacity: isVisible ? 1 : 0,
                transformOrigin: `${leaf.cx}px ${leaf.cy}px`,
                transition: 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 160ms ease',
              }}
            />
          );
        })}

        {/* Final orange fruit near bottom of page */}
        <circle
          cx="39"
          cy="24"
          r="2.8"
          fill="#F26B1D"
          style={{
            transform: state.showFruit ? 'scale(1)' : 'scale(0)',
            opacity: state.showFruit ? 1 : 0,
            transformOrigin: '39px 24px',
            transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease',
          }}
        />
      </svg>

      <span className="font-display font-bold text-[12px] leading-none text-[var(--ink)] tabular-nums">
        {state.percentage}%
      </span>
    </button>
  );
}
