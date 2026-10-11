'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Eye, FolderOpen, Loader2, Printer, Trash2, Upload } from 'lucide-react';
import { formatDate, formatNumber, isLocale, localized } from '@oxygen/shared';
import { brandButton } from '@/components/shared/brand';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PatientDocument } from '@/types/portal';
import {
  useDeleteDocumentMutation,
  useGetMyDocumentsQuery,
  useUploadDocumentMutation,
} from '../_api/documents.api';
import { DocumentIcon } from './document-icon';
import { PageHeader } from './page-header';
import { QueryError } from './query-error';

// اللي ينفع يترفع: PDF وصور، لحد 10 ميجا
const ACCEPT = 'application/pdf,image/jpeg,image/png';
const MAX_MB = 10;
const FILTERS = ['all', 'lab', 'imaging', 'plan', 'upload'] as const;
type Filter = (typeof FILTERS)[number];

/**
 * الملفات PP-04: فلتر بالنوع · معاينة (الملف بيتعرض كورقة بشعار Oxygen وبيتطبع/يتحفظ PDF من المتصفح)
 * · رفع (شكل: الاسم والحجم بس لحد ما الباك يجهز الرفع) · مسح اللي المريض رفعه بس. ?open=<id> بيفتح المعاينة.
 */
export function DocumentsView() {
  const t = useTranslations('portal.documents');
  const locale = useLocale();
  const documents = useGetMyDocumentsQuery();
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(useSearchParams().get('open'));
  const [upload, uploading] = useUploadDocumentMutation();
  const [remove] = useDeleteDocumentMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  if (!isLocale(locale)) return null;

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) {
      toast.error(t('wrongType'));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(t('tooBig', { max: MAX_MB }));
      return;
    }
    try {
      await upload({
        title: file.name,
        size_kb: Math.max(1, Math.round(file.size / 1024)),
      }).unwrap();
      toast.success(t('uploaded'));
    } catch {
      toast.error(t('uploadFailed'));
    }
  };

  const list = (documents.data ?? []).filter(
    (document) => filter === 'all' || document.kind === filter,
  );
  const open = documents.data?.find((document) => document.id === openId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={(event) => void onFile(event)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading.isLoading}
              className={brandButton({ tone: 'primary' })}
            >
              {uploading.isLoading ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Upload aria-hidden />
              )}
              {t('upload')}
            </button>
          </>
        }
      />
      <p className="-mt-3 text-sm text-muted-foreground">{t('uploadHint', { max: MAX_MB })}</p>

      <div role="group" aria-label={t('filter')} className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
              filter === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-ink hover:border-primary',
            )}
          >
            {t(`filters.${value}`)}
          </button>
        ))}
      </div>

      {documents.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : documents.isError ? (
        <QueryError onRetry={documents.refetch} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={filter === 'all' ? t('emptyTitle') : t('emptyFilter')}
          body={filter === 'all' ? t('emptyBody') : undefined}
        />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {list.map((document) => (
            <li key={document.id} className="flex items-center gap-3 p-4">
              <DocumentIcon kind={document.kind} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {localized(document, 'title', locale)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(`kinds.${document.kind}`)} · {formatDate(document.date, locale)} ·{' '}
                  <bdi>{t('size', { size: formatNumber(document.size_kb, locale) })}</bdi>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpenId(document.id)}
                  className="inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-primary hover:bg-mist"
                >
                  <Eye className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{t('view')}</span>
                  <span className="sr-only sm:hidden">
                    {t('view')} — {localized(document, 'title', locale)}
                  </span>
                </button>
                {document.uploaded_by_patient && (
                  <button
                    type="button"
                    onClick={() =>
                      void remove(document.id)
                        .unwrap()
                        .then(() => toast.success(t('deleted')))
                        .catch(() => toast.error(t('deleteFailed')))
                    }
                    aria-label={`${t('delete')} — ${localized(document, 'title', locale)}`}
                    className="grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && <PreviewDialog document={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function PreviewDialog({ document, onClose }: { document: PatientDocument; onClose: () => void }) {
  const t = useTranslations('portal.documents');
  const tSpecialty = useTranslations('specialtyNames');
  const locale = useLocale();
  if (!isLocale(locale)) return null;
  const title = localized(document, 'title', locale);

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t(`kinds.${document.kind}`)} · {formatDate(document.date, locale)}
          </DialogDescription>
        </DialogHeader>
        {/* الورقة نفسها: دي اللي بتتطبع (print:) */}
        <article className="print-area rounded-xl border border-border bg-white p-6 text-ink shadow-sm">
          <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <Image src="/logo.png" alt="Oxygen" width={1153} height={300} className="h-8 w-auto" />
            <div className="text-end text-sm text-muted-foreground">
              <p>{formatDate(document.date, locale)}</p>
              {document.specialty && <p>{tSpecialty(document.specialty)}</p>}
            </div>
          </header>
          <h2 className="mt-4 font-heading text-xl font-bold">{title}</h2>
          {document.preview.length > 0 ? (
            <dl className="mt-4 divide-y divide-border">
              {document.preview.map((line) => (
                <div key={line.label_en} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">{localized(line, 'label', locale)}</dt>
                  <dd className="text-end font-semibold">
                    <bdi>{line.value}</bdi>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-muted-foreground">{t('noPreview')}</p>
          )}
          <p className="mt-6 text-xs text-muted-foreground">{t('previewNote')}</p>
        </article>
        <DialogFooter>
          <button type="button" onClick={onClose} className={brandButton({ tone: 'outline' })}>
            {t('close')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className={brandButton({ tone: 'primary' })}
          >
            <Printer aria-hidden />
            {t('print')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
