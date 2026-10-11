import { getLocale, getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { PublicFaq } from '@/types/public';

// قايمة أسئلة (Accordion) — جوه FaqSection، وفي صفحة الأسئلة الشائعة تحت كل مجموعة
export async function FaqList({ faqs, className }: { faqs: PublicFaq[]; className?: string }) {
  const locale = await getLocale();
  if (!isLocale(locale) || faqs.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      className={cn('rounded-lg border border-border bg-card px-5', className)}
    >
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="min-h-11 items-center py-4 text-base font-semibold text-ink hover:no-underline">
            {localized(faq, 'question', locale)}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-base text-muted-foreground">
            {localized(faq, 'answer', locale)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// الأسئلة الشائعة (A4) في أي صفحة. مفيش أسئلة = القسم مش بيظهر
export async function FaqSection({ faqs }: { faqs: PublicFaq[] }) {
  if (faqs.length === 0) return null;
  const t = await getTranslations('faq');

  return (
    <section aria-labelledby="faq-title" className="py-12 lg:py-16">
      <Container className="max-w-3xl">
        <SectionHeading id="faq-title" title={t('title')} />
        <FaqList faqs={faqs} className="mt-6" />
      </Container>
    </section>
  );
}
