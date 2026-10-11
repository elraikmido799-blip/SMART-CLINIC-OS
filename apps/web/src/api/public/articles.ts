import { env } from '@/lib/env';
import { articleDetailMock, articlesMock } from '@/mocks/public/articles';
import {
  publicArticleDetailSchema,
  publicArticleSchema,
  type PublicArticleDetail,
} from '@/types/public';
import { fetchPublic, fetchPublicList, type PublicResult } from './fetch-public';

// الأحدث الأول (الـAPI بيرتّب)
export const getArticles = () => fetchPublicList('articles', publicArticleSchema, articlesMock);

export async function getArticle(slug: string): Promise<PublicResult<PublicArticleDetail>> {
  const mock = articleDetailMock(slug);
  // مقالة ملهاش Mock = نفس 404 اللي الـAPI هيرجّعه
  if (env.apiMocking && !mock) return { ok: false, error: 'not-found' };
  return fetchPublic(`articles/${encodeURIComponent(slug)}`, publicArticleDetailSchema, {
    data: mock!,
  });
}
