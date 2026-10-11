import { env } from '@/lib/env';
import { offerDetailMock, offersMock } from '@/mocks/public/offers';
import { publicOfferDetailSchema, publicOfferSchema, type PublicOfferDetail } from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';

export const getOffers = () => fetchPublicList('offers', publicOfferSchema, offersMock);

export async function getOffer(slug: string): Promise<PublicResult<PublicOfferDetail>> {
  const mock = offerDetailMock(slug);
  // عرض ملوش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`offers/${encodeURIComponent(slug)}`, publicOfferDetailSchema, {
    data: mock!,
  });
}
