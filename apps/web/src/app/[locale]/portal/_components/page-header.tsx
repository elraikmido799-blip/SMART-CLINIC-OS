type PageHeaderProps = { title: string; subtitle?: string; action?: React.ReactNode };

/** عنوان أي صفحة في البوابة (h1 واحد) + جملة + زرار على الطرف التاني */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-lg text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
