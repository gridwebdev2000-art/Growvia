interface GrowviaLogoProps {
  className?: string;
}

export function GrowviaLogo({ className = '' }: GrowviaLogoProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width="30"
        height="30"
        role="img"
        aria-label="Growvia mark"
        className="w-[25px] h-[25px] sm:w-[30px] sm:h-[30px] shrink-0"
      >
        <path
          d="M32 44 V59"
          className="stroke-[#1F4D33] dark:stroke-[#9BC094]"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M32 44 C15 44 9 32 10 20 C25 20 33 30 32 44 Z"
          className="fill-[#1F4D33] dark:fill-[#9BC094]"
        />
        <path
          d="M32 44 C50 44 57 26 55 8 C38 8 29 24 32 44 Z"
          className="fill-[#5E8F63] dark:fill-[#6FA374]"
        />
        <circle cx="31" cy="11" r="4.5" fill="#F26B1D" />
      </svg>
      <span className="font-display font-extrabold text-[1.15rem] sm:text-[1.35rem] leading-none tracking-[-0.03em] text-[var(--ink)] lowercase">
        growvia
      </span>
    </span>
  );
}
