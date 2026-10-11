import { todayInCairo } from './dates';

// العرض شغال لحد آخر يوم ends_at (ومن غير تاريخ = شغال)
export const isOfferActive = (offer: { ends_at: string | null }) =>
  offer.ends_at === null || offer.ends_at >= todayInCairo();

// نسبة التوفير المقرّبة ("وفّر 29%")
export const offerSavingPercent = (offer: {
  price_before_minor: number;
  price_after_minor: number;
}) => Math.round((1 - offer.price_after_minor / Math.max(offer.price_before_minor, 1)) * 100);
