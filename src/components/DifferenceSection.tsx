import { TEAM_MEMBERS } from '../data/agencyData';
import { useLocale } from '../context/LocaleContext';
import { KineticHeading } from './MotionPrimitives';

export function DifferenceSection() {
  const { t } = useLocale();
  const teamMembers = t.difference.team.length > 0 ? t.difference.team : TEAM_MEMBERS;

  return (
    <section
      id="about"
      className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto scroll-mt-24"
      aria-labelledby="difference-heading"
    >
      <div
        className="rounded-[36px] sm:rounded-[40px] p-7 sm:p-12 lg:p-16 border border-[var(--border)] relative overflow-hidden backdrop-blur-md"
        style={{
          backgroundColor: 'var(--panel-green)',
          color: 'var(--panel-green-text)',
          backgroundImage:
            'radial-gradient(circle at 18% 12%, rgba(94, 143, 99, 0.28), transparent 52%), radial-gradient(circle at 86% 88%, rgba(242, 107, 29, 0.16), transparent 46%)',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.22), var(--shadow-card)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-65"
          style={{
            background:
              'linear-gradient(90deg, transparent 5%, rgba(227,234,217,0.5) 35%, rgba(242,107,29,0.45) 65%, transparent 95%)',
          }}
        />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          {/* Left: Story & Strengths */}
          <div className="lg:col-span-5">
            <p className="eyebrow !text-[#E3EAD9]/85">{t.difference.eyebrow}</p>
            <KineticHeading
              id="difference-heading"
              className="mt-4 text-[clamp(2.2rem,4.1vw,3.55rem)] leading-[1.06] font-extrabold text-[#EEF0E4]"
              segments={[
                { text: t.difference.headingLead },
                {
                  text: t.difference.headingHighlight,
                  highlight: true,
                  highlightStyle: { color: 'var(--panel-peach)' },
                },
              ]}
            />

            <p className="mt-5 text-[17.5px] sm:text-[18.5px] leading-[1.6] text-[#E3EAD9]/85">
              {t.difference.body}
            </p>

            <ul className="mt-8 space-y-4">
              {t.difference.strengths.map((point) => (
                <li key={point} className="flex items-start gap-3.5 text-[16px] leading-snug text-[#EEF0E4]">
                  <span
                    className="w-3 h-3 rounded-full bg-[#F26B1D] mt-1.5 shrink-0 shadow-[0_0_10px_rgba(242,107,29,0.55)]"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Three Team Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <article
                key={member.id}
                className="shine-card rounded-[24px] bg-[#17301F]/70 backdrop-blur-md border border-white/20 p-3.5 flex flex-col transition-transform duration-200 hover:-translate-y-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
              >
                <div
                  className="aspect-[4/3] sm:aspect-square w-full rounded-[18px] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden border border-white/10"
                  style={{ background: member.gradient }}
                >
                  <svg
                    viewBox="0 0 180 180"
                    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                    aria-hidden="true"
                  >
                    <circle cx="90" cy="90" r="64" stroke="#E3EAD9" strokeWidth="1" fill="none" />
                    <circle cx="90" cy="90" r="46" stroke="#A9BFA3" strokeWidth="1" fill="none" />
                  </svg>
                  <span className="relative z-10 mb-3 rounded-full bg-white/10 border border-white/15 px-3 py-0.5 text-[10.5px] font-semibold tracking-wider uppercase text-[#E3EAD9]/95 whitespace-nowrap">
                    {member.focusTag}
                  </span>
                  <div
                    className="relative z-10 w-16 h-16 shrink-0 rounded-full bg-[#E3EAD9]/20 border border-[#E3EAD9]/45 flex items-center justify-center font-display font-extrabold text-xl text-[#EEF0E4] shadow-inner"
                    aria-hidden="true"
                  >
                    {member.initials}
                  </div>
                </div>

                <div className="mt-4 px-1.5 pb-1 flex-1 flex flex-col">
                  <h3 className="text-[1.1rem] font-bold text-[#EEF0E4] leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-[13px] font-medium text-[#F6C8A5] mt-0.5">{member.role}</p>
                  <p className="text-[13px] leading-[1.5] text-[#E3EAD9]/85 mt-2">
                    {member.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
