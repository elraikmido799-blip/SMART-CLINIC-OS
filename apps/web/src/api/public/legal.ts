import { legalPageMock } from '@/mocks/public/legal';
import { publicLegalPageSchema, type LegalSlug } from '@/types/public';
import { fetchPublic } from './fetch-public';

export const getLegalPage = (slug: LegalSlug) =>
  fetchPublic(`legal/${slug}`, publicLegalPageSchema, { data: legalPageMock(slug) });
