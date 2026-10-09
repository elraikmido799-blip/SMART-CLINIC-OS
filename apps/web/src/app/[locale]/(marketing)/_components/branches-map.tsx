'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
import type { Locale } from '@oxygen/shared';
import { cn } from '@/lib/utils';

export type BranchView = {
  id: string;
  name: string;
  hours: string;
  mapsUrl: string;
  latitude: number;
  longitude: number;
};

const MAP_ZOOM = 14;

// Google Maps Embed من غير API key: بيعرض مكان واحد، وبلغة الزائر
const embedUrl = (branch: BranchView, locale: Locale) =>
  `https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=${MAP_ZOOM}&hl=${locale}&output=embed`;

/** الخريطة بتعرض الفرع المختار. الخريطة نفسها بتتحمّل لما الزائر يوصل لها (loading=lazy) */
export function BranchesMap({ branches, locale }: { branches: BranchView[]; locale: Locale }) {
  const t = useTranslations('branches');
  const [selectedId, setSelectedId] = useState(branches[0].id);
  const selected = branches.find((branch) => branch.id === selectedId) ?? branches[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6">
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-mist lg:aspect-auto lg:min-h-80">
        <iframe
          key={selected.id}
          src={embedUrl(selected, locale)}
          title={t('mapTitle', { branch: selected.name })}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="size-full border-0"
        />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => {
          const isSelected = branch.id === selected.id;
          return (
            <li
              key={branch.id}
              className={cn(
                'flex flex-col rounded-lg border bg-card p-4 transition-colors',
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border',
              )}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(branch.id)}
                className="flex min-h-11 items-center gap-2 rounded-md text-start font-semibold text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
                {branch.name}
                <span className="sr-only">{t('showOnMap')}</span>
              </button>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" aria-hidden />
                {branch.hours}
              </p>
              <a
                href={branch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
              >
                {t('directions')}
                <span className="sr-only"> — {branch.name}</span>
                <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
