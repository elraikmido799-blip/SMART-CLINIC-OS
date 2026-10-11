import { env } from '@/lib/env';
import { programDetailMock } from '@/mocks/public/program-details';
import { programsMock } from '@/mocks/public/programs';
import {
  publicProgramDetailSchema,
  publicProgramSchema,
  type PublicProgramDetail,
} from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';

export const getPrograms = () => fetchPublicList('programs', publicProgramSchema, programsMock);

export async function getProgram(slug: string): Promise<PublicResult<PublicProgramDetail>> {
  const mock = programDetailMock(slug);
  // برنامج ملوش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`programs/${encodeURIComponent(slug)}`, publicProgramDetailSchema, {
    data: mock!,
  });
}
