// النهارده بتوقيت مصر "YYYY-MM-DD" (en-CA بيكتب التاريخ بالشكل ده)
export const todayInCairo = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());

// العرض شغال لحد آخر يوم ends_at (ومن غير تاريخ = شغال)
export const isOfferActive = (offer: { ends_at: string | null }) =>
  offer.ends_at === null || offer.ends_at >= todayInCairo();
