import Markdown, { type Components } from 'react-markdown';
import { Link } from '@/i18n/navigation';

const linkClass = 'font-semibold text-primary underline underline-offset-4 hover:no-underline';

/**
 * أي كلام طويل جاي Markdown من الداشبورد (المقالات + الصفحات القانونية). كل عنصر ليه شكله هنا بدل plugin الـtypography:
 * نفس خطوط وألوان الموقع، وسطر مريح للقراية (max-w-prose)، ومن غير HTML خام (react-markdown بيمنعه).
 * العناوين بتبدأ من h2 لأن h1 هو عنوان الصفحة.
 */
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-10 font-heading text-2xl font-bold text-ink">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 font-heading text-2xl font-bold text-ink">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-heading text-xl font-bold text-ink">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 text-lg leading-relaxed text-ink">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 ps-6 text-lg text-ink marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 ps-6 text-lg text-ink marker:font-semibold marker:text-primary">
      {children}
    </ol>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  // لينك جوه الموقع (/contact) بيفضل على نفس اللغة، واللي بره بيفتح في Tab جديدة
  a: ({ children, href }) =>
    href?.startsWith('/') ? (
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    ) : (
      <a
        href={href}
        className={linkClass}
        {...(href?.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
      </a>
    ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-s-4 border-primary bg-mist px-5 py-3 text-ink">
      {children}
    </blockquote>
  ),
  // الصور جوه المقالة: Phase 2 (محتاجة رفع من الداشبورد). لحد كده مش بتتعرض
  img: () => null,
};

export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-prose [&>*:first-child]:mt-0">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
