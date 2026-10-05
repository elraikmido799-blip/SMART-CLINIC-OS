import { tokens } from './tokens';

const toKebab = (key: string) => key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

/**
 * بيحوّل الـTokens لـCSS variables بالشكل ده: `:root{--oxy-primary:#0E8C7F;…}`.
 * الموقع بيحطها في الـ<head>، وglobals.css بيربطها بأسامي Tailwind و shadcn.
 */
export function tokensToCss(): string {
  const variables: Record<string, string> = {
    ...tokens.color,
    ...tokens.specialty,
    radius: `${tokens.radius}px`,
  };

  const body = Object.entries(variables)
    .map(([key, value]) => `--oxy-${toKebab(key)}:${value}`)
    .join(';');

  return `:root{${body}}`;
}
