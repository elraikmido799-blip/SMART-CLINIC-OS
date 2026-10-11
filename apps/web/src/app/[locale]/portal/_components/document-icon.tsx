import { ClipboardList, FileText, FlaskConical, ImageIcon, Pill, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientDocument } from '@/types/portal';

// كل نوع ملف ليه أيقونة ولون خلفية فاتح (زي PP-01). الألوان من التوكنز (التخصصات)
const KINDS: Record<PatientDocument['kind'], { icon: typeof FileText; className: string }> = {
  lab: { icon: FlaskConical, className: 'bg-nutrition/10 text-nutrition' },
  imaging: { icon: ImageIcon, className: 'bg-physio/10 text-physio' },
  plan: { icon: ClipboardList, className: 'bg-derm/10 text-derm' },
  prescription: { icon: Pill, className: 'bg-internal/10 text-internal' },
  report: { icon: FileText, className: 'bg-mist text-primary' },
  upload: { icon: Upload, className: 'bg-mist text-primary' },
};

export function DocumentIcon({
  kind,
  className,
}: {
  kind: PatientDocument['kind'];
  className?: string;
}) {
  const { icon: Icon, className: tone } = KINDS[kind];
  return (
    <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl', tone, className)}>
      <Icon className="size-6" aria-hidden />
    </span>
  );
}
