import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// صفحة مؤقتة عشان نتأكد إن الأساس شغال (اللغة، RTL، الخطوط، الألوان، Motion). هتتبني بجد في المرحلة 3
export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-ink">{t('title')}</h1>
      <p className="text-lg text-muted-foreground">{t('subtitle')}</p>

      <Reveal className="flex flex-wrap gap-2">
        <Badge className="bg-nutrition">{t('specialties.nutrition')}</Badge>
        <Badge className="bg-physio">{t('specialties.physio')}</Badge>
        <Badge className="bg-derm">{t('specialties.derm')}</Badge>
        <Badge className="bg-internal">{t('specialties.internal')}</Badge>
      </Reveal>

      <div className="flex gap-3">
        <Button className="bg-coral hover:bg-coral/90">{t('bookNow')}</Button>
        <Button variant="outline">{t('patientLogin')}</Button>
      </div>
    </main>
  );
}
