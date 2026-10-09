import { doctorsMock } from '@/mocks/public/doctors';
import { publicDoctorSchema } from '@/types/public';
import { fetchPublicList } from './fetch-public';

export const getDoctors = () => fetchPublicList('doctors', publicDoctorSchema, doctorsMock);
