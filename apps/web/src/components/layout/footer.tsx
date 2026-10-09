import { getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';
import { Link } from '@/i18n/navigation';
import { whatsappUrl } from '@/lib/whatsapp';

const COLUMNS = [
  {
    key: 'clinic',
    links: [
      { key: 'branches', href: '/branches' },
      { key: 'doctors', href: '/doctors' },
      { key: 'about', href: '/about' },
    ],
  },
  {
    key: 'programs',
    links: [
      { key: 'nutrition', href: '/specialties/nutrition' },
      { key: 'physio', href: '/specialties/physio' },
      { key: 'derm', href: '/specialties/derm' },
      { key: 'internal', href: '/specialties/internal' },
    ],
  },
  {
    key: 'help',
    links: [
      { key: 'faqs', href: '/faqs' },
      { key: 'contact', href: '/contact' },
      { key: 'book', href: '/book' },
    ],
  },
] as const;

const LEGAL_LINKS = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
  { key: 'sitemap', href: '/sitemap' },
] as const;

// الـFooter (A2): كحلي، والكلام فيه مش أقل من 14px عشان يتقري (مراجعة A2)
export async function Footer() {
  const t = await getTranslations('footer');
  const tWhatsapp = await getTranslations('whatsapp');

  return (
    <footer className="bg-ink text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
        <div className="max-w-xs">
          <Logo variant="white" layout="stacked" className="w-36" />
          <p className="mt-4 text-sm leading-relaxed text-white/80">{t('about')}</p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.key} aria-labelledby={`footer-${column.key}`}>
            <h2 id={`footer-${column.key}`} className="text-sm font-semibold">
              {t(`columns.${column.key}.title`)}
            </h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-white">
                    {t(`columns.${column.key}.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <a
            href={whatsappUrl(tWhatsapp('defaultMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            className={brandButton({ tone: 'onDark' })}
          >
            <MessageCircle aria-hidden />
            {tWhatsapp('cta')}
          </a>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-3 py-5 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="hover:text-white">
                  {t(`legal.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        </Container>
      </div>
    </footer>
  );
}
