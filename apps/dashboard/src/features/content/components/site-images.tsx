import { useRef, useState } from 'react';
import { App, Button, Card, Flex, Typography } from 'antd';
import { ImageIcon, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { resizeImage } from '@/lib/image-resize';
import { useGetSiteImagesQuery, useSetSiteImageMutation } from '../content.api';
import type { SiteImage } from '../types';

/**
 * صور الموقع (D-33): صورة الـHero في الرئيسية و"من نحن" وصورة كل دكتور. الموظف بيرفع صورة (بتتصغّر في المتصفح) أو بيرجّع
 * الافتراضية. الموقع بيقرا الصور دي من الـAPI (docs/16)، فتتغير من غير ما حد يلمس الكود.
 */
export function SiteImages() {
  const { t } = useTranslation('content');
  const locale = useLocale();
  const { message } = App.useApp();
  const images = useGetSiteImagesQuery();
  const [save, saveState] = useSetSiteImageMutation();
  const [busy, setBusy] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const target = useRef<string>('');

  const labelOf = (image: SiteImage) => {
    if (image.slot === 'home_hero') return t('images.home_hero');
    if (image.slot === 'about_hero') return t('images.about_hero');
    return t('images.doctor', {
      name: locale === 'ar' ? (image.name_ar ?? image.slot) : (image.name_en ?? image.slot),
    });
  };

  const pick = (slot: string) => {
    target.current = slot;
    input.current?.click();
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(target.current);
    try {
      await save({ slot: target.current, url: await resizeImage(file) }).unwrap();
      void message.success(t('images.saved'));
    } catch {
      void message.error(t('images.failed'));
    } finally {
      setBusy(null);
      if (input.current) input.current.value = '';
    }
  };

  if (images.isLoading) return <LoadingState />;
  if (images.isError) return <ErrorState onRetry={() => void images.refetch()} />;
  const slots: SiteImage[] = images.data ?? [];
  if (slots.length === 0) return <EmptyState title={t('images.empty')} />;

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        aria-label={t('images.choose')}
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {slots.map((slot) => (
          <Card key={slot.slot} styles={{ body: { padding: 12 } }}>
            <div
              style={{
                aspectRatio: '4 / 3',
                borderRadius: 8,
                background: tokens.color.mist,
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              {slot.url ? (
                <img
                  src={slot.url}
                  alt={labelOf(slot)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Flex vertical align="center" gap={4} style={{ color: tokens.color.mutedText }}>
                  <ImageOff size={28} aria-hidden />
                  <Typography.Text type="secondary">{t('images.default')}</Typography.Text>
                </Flex>
              )}
            </div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              {labelOf(slot)}
            </Typography.Text>
            <Flex gap={8}>
              <Button
                size="small"
                icon={<ImageIcon size={14} aria-hidden />}
                loading={busy === slot.slot}
                onClick={() => pick(slot.slot)}
              >
                {t('images.change')}
              </Button>
              {slot.url && (
                <Button
                  size="small"
                  disabled={saveState.isLoading}
                  onClick={() => void save({ slot: slot.slot, url: null })}
                >
                  {t('images.reset')}
                </Button>
              )}
            </Flex>
          </Card>
        ))}
      </div>
    </>
  );
}
