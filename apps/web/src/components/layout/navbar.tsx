import { getTranslations } from 'next-intl/server';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';
import { BOOK_HREF, LOGIN_HREF, NAV_LINKS } from './nav-links';

// الـNavbar (A1 · A3): ثابت فوق. في الموبايل اللوجو + احجز + القايمة
export async function Navbar() {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <Container className="flex h-18 items-center gap-3 sm:gap-6">
        <Link href="/" aria-label={t('home')} className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <nav aria-label={t('mainNav')} className="hidden flex-1 justify-center xl:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-ink hover:bg-mist"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 xl:ms-0">
          <LanguageSwitcher className="hidden xl:inline-flex" />
          <Link
            href={LOGIN_HREF}
            className={cn(brandButton({ tone: 'outline' }), 'hidden xl:inline-flex')}
          >
            {t('patientLogin')}
          </Link>
          {/* على الموبايل "Book" بس (A3): من غيرها الـNavbar أعرض من شاشة 320 */}
          <Link href={BOOK_HREF} className={cn(brandButton({ tone: 'gold' }), 'px-4 sm:px-5')}>
            <span className="sm:hidden">{t('book')}</span>
            <span className="hidden sm:inline">{t('bookNow')}</span>
          </Link>
          <div className="xl:hidden">
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
