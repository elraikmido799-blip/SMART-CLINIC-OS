import { aboutContentMock, homeContentMock, onlineConsultationMock } from '@/mocks/public/content';
import { aboutContentSchema, homeContentSchema, onlineConsultationSchema } from '@/types/public';
import { fetchPublic } from './fetch-public';

export const getHomeContent = () =>
  fetchPublic('content/home', homeContentSchema, { data: homeContentMock });

export const getAboutContent = () =>
  fetchPublic('content/about', aboutContentSchema, { data: aboutContentMock });

export const getOnlineConsultation = () =>
  fetchPublic('content/online-consultation', onlineConsultationSchema, {
    data: onlineConsultationMock,
  });
