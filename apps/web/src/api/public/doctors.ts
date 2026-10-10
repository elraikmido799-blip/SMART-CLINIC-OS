import { env } from '@/lib/env';
import { doctorDetailMock } from '@/mocks/public/doctor-details';
import { doctorsMock } from '@/mocks/public/doctors';
import {
  publicDoctorDetailSchema,
  publicDoctorSchema,
  type PublicDoctorDetail,
} from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';

export const getDoctors = () => fetchPublicList('doctors', publicDoctorSchema, doctorsMock);

export async function getDoctor(slug: string): Promise<PublicResult<PublicDoctorDetail>> {
  const mock = doctorDetailMock(slug);
  // دكتور ملوش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`doctors/${encodeURIComponent(slug)}`, publicDoctorDetailSchema, {
    data: mock!,
  });
}
