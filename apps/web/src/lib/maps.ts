import type { Locale } from '@oxygen/shared';

const MAP_ZOOM = 14;

// Google Maps Embed من غير API key: بيعرض مكان واحد، وبلغة الزائر (DEC-28)
export const mapsEmbedUrl = (latitude: number, longitude: number, locale: Locale) =>
  `https://maps.google.com/maps?q=${latitude},${longitude}&z=${MAP_ZOOM}&hl=${locale}&output=embed`;
