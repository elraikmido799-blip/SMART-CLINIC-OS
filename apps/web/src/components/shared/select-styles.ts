// شكل خانات الاختيار (Select) في الموقع: شريط الحجز (A1) وفلتر الفروع (A5)

// shadcn بيحط data-[size=default]:h-8، فلازم نكتب الارتفاع بنفس الشكل (P-14)
export const FIELD_TRIGGER =
  'h-11 w-full justify-start gap-2 rounded-md border-field-border bg-card px-3 text-sm text-ink transition-colors hover:border-primary data-[size=default]:h-11 data-placeholder:text-muted-foreground data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-ring/30 *:data-[slot=select-value]:flex-1 [&>svg:first-child]:text-primary [&>svg:last-child]:ms-auto [&>svg:last-child]:transition-transform data-[state=open]:[&>svg:last-child]:rotate-180';

// القايمة بتفتح تحت الخانة على طول وبنفس عرضها (L-35)
export const FIELD_CONTENT =
  'w-(--radix-select-trigger-width) rounded-md border border-border p-1.5 shadow-lg ring-0';

export const FIELD_ITEM =
  'min-h-11 cursor-pointer rounded-md ps-3 pe-9 text-sm text-ink focus:bg-mist focus:text-ink data-[state=checked]:font-semibold data-[state=checked]:text-primary [&_svg]:text-primary';
