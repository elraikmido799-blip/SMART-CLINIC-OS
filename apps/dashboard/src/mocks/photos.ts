import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { DermPlan, DermPlanBody } from '@/features/derm-plans/types';
import type { PatientPhoto, UploadPhotoBody } from '@/features/photos/types';
import { currentStaff } from './auth';
import { readDb, writeDb } from './db';

/** صور المريض وخطط الجلدية الوهمية (4.7). الصور بتتخزن مصغّرة (Data URL) في الـMock DB */
const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

export const photoHandlers: MockHandlers = {
  getPatientPhotos: ({ url }) => {
    const patientId = idFrom(url, 2);
    const data = readDb()
      .photos.filter((item) => item.patient_id === patientId)
      .sort((a, b) => a.taken_on.localeCompare(b.taken_on));
    return { data };
  },

  uploadPatientPhoto: ({ url, body }) => {
    if (!currentStaff().specialty) throw new MockHttpError(403, 'FORBIDDEN');
    const { image, ...input } = body as Omit<UploadPhotoBody, 'patient_id'> & { image: string };
    if (!image.startsWith('data:image/')) throw new MockHttpError(422, 'INVALID_IMAGE');
    const photo: PatientPhoto = {
      id: `photo-${Date.now()}`,
      patient_id: idFrom(url, 2),
      taken_on: input.taken_on,
      angle: input.angle,
      note: input.note,
      image_url: image,
    };
    writeDb((db) => {
      db.photos.push(photo);
    });
    return photo;
  },

  getDermPlan: ({ url }) => {
    const patientId = idFrom(url, 2);
    const stored = readDb().derm_plans.find((item) => item.patient_id === patientId);
    if (stored) return stored;
    const empty: DermPlan = { patient_id: patientId, procedures: [], notes: '', updated_at: null };
    return empty;
  },

  saveDermPlan: ({ url, body }) => {
    if (!currentStaff().specialty) throw new MockHttpError(403, 'FORBIDDEN');
    const patientId = idFrom(url, 2);
    const plan: DermPlan = {
      ...(body as DermPlanBody),
      patient_id: patientId,
      updated_at: new Date().toISOString(),
    };
    writeDb((db) => {
      db.derm_plans = [...db.derm_plans.filter((item) => item.patient_id !== patientId), plan];
    });
    return plan;
  },
};
