import { env } from '@/lib/env';
import { branchDetailMock } from '@/mocks/public/branch-details';
import { branchesMock } from '@/mocks/public/branches';
import {
  publicBranchDetailSchema,
  publicBranchSchema,
  type PublicBranchDetail,
} from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';

export const getBranches = () => fetchPublicList('branches', publicBranchSchema, branchesMock);

export async function getBranch(slug: string): Promise<PublicResult<PublicBranchDetail>> {
  const mock = branchDetailMock(slug);
  // فرع ملوش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`branches/${encodeURIComponent(slug)}`, publicBranchDetailSchema, {
    data: mock!,
  });
}
