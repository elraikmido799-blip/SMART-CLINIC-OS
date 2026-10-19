import { z } from 'zod';

// زاوية الصورة: المقارنة (قبل / بعد) لازم تبقى بنفس الزاوية
export const PHOTO_ANGLES = ['front', 'left', 'right', 'close_up'] as const;

export type PhotoAngle = (typeof PHOTO_ANGLES)[number];

/** صور المريض (الجلدية: قبل / بعد). 4.7 · D-14 */
export const patientPhotoSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  // يوم التصوير (مش يوم الرفع)
  taken_on: z.string(),
  angle: z.enum(PHOTO_ANGLES),
  note: z.string(),
  image_url: z.string(),
});

export type PatientPhoto = z.infer<typeof patientPhotoSchema>;

export type UploadPhotoBody = {
  patient_id: string;
  taken_on: string;
  angle: PhotoAngle;
  note: string;
  // الـMocks: Data URL مصغّرة. الحقيقي: مفتاح الملف بعد الرفع بـPre-signed URL
  image: string;
};
