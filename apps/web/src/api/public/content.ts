import { homeContentMock } from '@/mocks/public/content';
import { homeContentSchema } from '@/types/public';
import { fetchPublic } from './fetch-public';

export const getHomeContent = () =>
  fetchPublic('content/home', homeContentSchema, { data: homeContentMock });
