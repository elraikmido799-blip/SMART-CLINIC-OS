import type { Specialty } from '@oxygen/config';
import { env } from '@/lib/env';
import { specialtiesMock } from '@/mocks/public/specialties';
import { specialtyDetailMock } from '@/mocks/public/specialty-details';
import { publicSpecialtyDetailSchema, publicSpecialtySchema } from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';
import type { PublicSpecialtyDetail } from '@/types/public';

export const getSpecialties = () =>
  fetchPublicList('specialties', publicSpecialtySchema, specialtiesMock);

export async function getSpecialty(slug: Specialty): Promise<PublicResult<PublicSpecialtyDetail>> {
  const mock = specialtyDetailMock(slug);
  // تخصص ملوش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`specialties/${slug}`, publicSpecialtyDetailSchema, { data: mock! });
}
