import { programsMock } from '@/mocks/public/programs';
import { publicProgramSchema } from '@/types/public';
import { fetchPublicList } from './fetch-public';

export const getPrograms = () => fetchPublicList('programs', publicProgramSchema, programsMock);
