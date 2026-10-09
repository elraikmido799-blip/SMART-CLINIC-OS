import { specialtiesMock } from '@/mocks/public/specialties';
import { publicSpecialtySchema } from '@/types/public';
import { fetchPublicList } from './fetch-public';

export const getSpecialties = () =>
  fetchPublicList('specialties', publicSpecialtySchema, specialtiesMock);
