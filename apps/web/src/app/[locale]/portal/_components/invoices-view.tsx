'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Printer, ReceiptText } from 'lucide-react';
import { formatDate, formatEgyptianMobile, formatMoney, isLocale, localized } from '@oxygen/shared';
import { useGetMeQuery } from '@/api/auth.api';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from '@/i18n/navigation';
import type { Invoice } from '@/types/portal';
import { useGetMyInvoicesQuery } from '../_api/account.api';
import { PageHeader } from './page-header';
import { QueryError } from './query-error';
import { StatusBadge } from './status-badge';

/**
 * الفواتير PP-07: جدول على الكمبيوتر وكروت على الموبايل. كل فاتورة: "اعرض" (ورقة بتتطبع/تتحفظ PDF)،
 * والمش مدفوعة "ادفع دلوقتي" ← /checkout. فوق: إجمالي المدفوع.
 */
export function InvoicesView() {
  const t = useTranslations('portal.invoices');
  const locale = useLocale();
  const invoices = useGetMyInvoicesQuery();
  const [openId, setOpenId] = useState<string | null>(null);
  if (!isLocale(locale)) return null;

  const data = invoices.data ?? [];
  const currency = data[0]?.currency ?? 'EGP';
  const paidTotal = data
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + item.amount_minor, 0);
  const money = (minor: number, code = currency) => formatMoney(minor, code, locale);
  const open = data.find((item) => item.id === openId);

  const actions = (invoice: Invoice) => (
    <div className="flex flex-wrap justify-end gap-2">
      {invoice.status === 'unpaid' && invoice.booking_id && (
        <Link
          href={{ pathname: '/checkout', query: { booking: invoice.booking_id } }}
          className={brandButton({ tone: 'gold', size: 'md' })}
        >
          {t('payNow')}
        </Link>
      )}
      <button
        type="button"
        onClick={() => setOpenId(invoice.id)}
        className={brandButton({ tone: 'outline', size: 'md' })}
      >
        {t('view')}
        <span className="sr-only"> — {invoice.number}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {invoices.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : invoices.isError ? (
        <QueryError onRetry={invoices.refetch} />
      ) : data.length === 0 ? (
        <EmptyState icon={ReceiptText} title={t('emptyTitle')} body={t('emptyBody')} />
      ) : (
        <>
          <p className="rounded-2xl border border-border bg-card p-4 text-ink">
            {t('paidTotal')}{' '}
            <span className="font-heading text-xl font-bold">{money(paidTotal)}</span>
          </p>

          {/* كمبيوتر: جدول */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-5">{t('number')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('item')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="pe-5 text-end">
                    <span className="sr-only">{t('actions')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="ps-5 font-semibold">
                      <bdi dir="ltr">{invoice.number}</bdi>
                    </TableCell>
                    <TableCell>{formatDate(invoice.date, locale)}</TableCell>
                    <TableCell className="max-w-56 truncate">
                      {localized(invoice, 'title', locale)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {money(invoice.amount_minor, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="pe-5">{actions(invoice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* موبايل: كروت */}
          <ul className="space-y-3 md:hidden">
            {data.map((invoice) => (
              <li key={invoice.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {localized(invoice, 'title', locale)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <bdi dir="ltr">{invoice.number}</bdi> · {formatDate(invoice.date, locale)}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-heading text-xl font-bold text-ink">
                    {money(invoice.amount_minor, invoice.currency)}
                  </p>
                  {actions(invoice)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {open && <InvoiceDialog invoice={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function InvoiceDialog({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const t = useTranslations('portal.invoices');
  const locale = useLocale();
  const me = useGetMeQuery();
  if (!isLocale(locale)) return null;
  const amount = formatMoney(invoice.amount_minor, invoice.currency, locale);

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('invoiceTitle', { number: invoice.number })}</DialogTitle>
          <DialogDescription>{formatDate(invoice.date, locale)}</DialogDescription>
        </DialogHeader>
        <article className="print-area rounded-xl border border-border bg-white p-6 text-ink">
          <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <Image src="/logo.png" alt="Oxygen" width={1153} height={300} className="h-8 w-auto" />
            <div className="text-end">
              <p className="font-heading text-lg font-bold">{t('invoice')}</p>
              <p className="text-sm text-muted-foreground">
                <bdi dir="ltr">{invoice.number}</bdi>
              </p>
            </div>
          </header>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('billedTo')}</dt>
              <dd className="font-semibold">{me.data?.full_name || '—'}</dd>
              {me.data && (
                <dd className="text-muted-foreground">
                  <bdi dir="ltr">{formatEgyptianMobile(me.data.phone)}</bdi>
                </dd>
              )}
            </div>
            <div className="text-end">
              <dt className="text-muted-foreground">{t('date')}</dt>
              <dd className="font-semibold">{formatDate(invoice.date, locale)}</dd>
            </div>
          </dl>
          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-start font-medium">{t('item')}</th>
                <th className="py-2 text-end font-medium">{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3">{localized(invoice, 'title', locale)}</td>
                <td className="py-3 text-end">{amount}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-3 font-semibold">{t('total')}</td>
                <td className="pt-3 text-end font-heading text-lg font-bold">{amount}</td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-4">
            <StatusBadge status={invoice.status} />
          </div>
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
            {t('download')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
