import { aboutContentMock, homeContentMock } from '@/mocks/public/content';
import { aboutContentSchema, homeContentSchema } from '@/types/public';
import { fetchPublic } from './fetch-public';

export const getHomeContent = () =>
  fetchPublic('content/home', homeContentSchema, { data: homeContentMock });

export const getAboutContent = () =>
  fetchPublic('content/about', aboutContentSchema, { data: aboutContentMock });
