/**
 * تصدير جدول كملف CSV بيتفتح في Excel بالعربي صح (BOM + UTF-8). الخلايا اللي فيها فاصلة أو علامة تنصيص أو سطر جديد
 * بتتحط بين علامات تنصيص. بيتنزّل من المتصفح من غير الـAPI (تصدير xlsx/PDF الحقيقي شغل الباك — DEC-69).
 */
export function toCsv(header: string[], rows: (string | number)[][]): string {
  const cell = (value: string | number) => {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
