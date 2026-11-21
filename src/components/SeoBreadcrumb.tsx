import { ChevronRight, Home } from 'lucide-react';
import { navigateToRoute } from '../utils/navigation';
import { buildLocalizedBreadcrumbTrail } from '../utils/seoConfig';
import type { SeoRoutePath } from '../utils/seoConfig';

interface SeoBreadcrumbProps {
  routePath: Exclude<SeoRoutePath, '/'> | null;
  ariaLabel: string;
  homeLabel: string;
  currentLabel?: string;
  notFoundLabel?: string;
  className?: string;
}

export function SeoBreadcrumb({
  routePath,
  ariaLabel,
  homeLabel,
  currentLabel,
  notFoundLabel,
  className = 'mb-5',
}: SeoBreadcrumbProps) {
  const items = buildLocalizedBreadcrumbTrail(routePath, {
    homeLabel,
    currentLabel,
    notFoundLabel,
  });

  return (
    <nav aria-label={ariaLabel} data-testid="subpage-breadcrumb" className={className}>
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-snug text-[var(--muted)]"
      >
        {items.map((item, idx) => (
          <li
            key={item.path ?? `crumb-${item.position}`}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="inline-flex items-center gap-2 min-w-0"
          >
            {idx > 0 && (
              <ChevronRight
                className="w-3.5 h-3.5 text-[var(--muted)]/55 shrink-0"
                aria-hidden="true"
              />
            )}
            {!item.isCurrent && item.path ? (
              <a
                href={item.path}
                itemProp="item"
                itemID={item.url ?? undefined}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToRoute(item.path!);
                }}
                className="inline-flex items-center gap-1.5 font-medium text-[var(--muted)] hover:text-[#F26B1D] transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26B1D]"
              >
                {item.path === '/' && (
                  <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                )}
                <span itemProp="name">{item.name}</span>
              </a>
            ) : (
              <>
                {item.url && <link itemProp="item" href={item.url} />}
                <span aria-current="page" className="font-semibold text-[var(--ink)]">
                  <span itemProp="name">{item.name}</span>
                </span>
              </>
            )}
            <meta itemProp="position" content={String(item.position)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
