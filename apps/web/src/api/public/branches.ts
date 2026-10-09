import { branchesMock } from '@/mocks/public/branches';
import { publicBranchSchema } from '@/types/public';
import { fetchPublicList } from './fetch-public';

export const getBranches = () => fetchPublicList('branches', publicBranchSchema, branchesMock);
