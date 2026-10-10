import { env } from '@/lib/env';
import { serviceDetailMock, servicesMock } from '@/mocks/public/services';
import {
  publicServiceDetailSchema,
  publicServiceSchema,
  type PublicServiceDetail,
} from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';

export const getServices = () => fetchPublicList('services', publicServiceSchema, servicesMock);

export async function getService(slug: string): Promise<PublicResult<PublicServiceDetail>> {
  const mock = serviceDetailMock(slug);
  // خدمة ملهاش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`services/${encodeURIComponent(slug)}`, publicServiceDetailSchema, {
    data: mock!,
  });
}
