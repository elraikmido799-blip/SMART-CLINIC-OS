import { baseApi } from '@/store/base-api';
import {
  labSchema,
  measurementsSchema,
  medicationsSchema,
  vitalSchema,
  type AddLabBody,
  type AddVitalsBody,
  type Lab,
  type Measurements,
  type Medications,
  type MedicationsBody,
  type Vital,
} from './types';

/** القياسات والأدوية (4.8). 422 `INVALID_VALUE` لو قيمة برة المعقول */
export const measurementsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMeasurements: build.query<Measurements, string>({
      query: (patientId) => `/staff/patients/${patientId}/measurements`,
      responseSchema: measurementsSchema,
      providesTags: (_result, _error, patientId) => [{ type: 'Measurements', id: patientId }],
    }),
    // المساعد بيدخّل العلامات الحيوية قبل الدكتور (§vitals.write§)
    addVitals: build.mutation<Vital, AddVitalsBody>({
      query: ({ patient_id, ...body }) => ({
        url: `/staff/patients/${patient_id}/vitals`,
        method: 'POST',
        body,
      }),
      responseSchema: vitalSchema,
      invalidatesTags: (_result, _error, { patient_id }) => [
        { type: 'Measurements', id: patient_id },
        'Patients',
      ],
    }),
    addLab: build.mutation<Lab, AddLabBody>({
      query: ({ patient_id, ...body }) => ({
        url: `/staff/patients/${patient_id}/labs`,
        method: 'POST',
        body,
      }),
      responseSchema: labSchema,
      invalidatesTags: (_result, _error, { patient_id }) => [
        { type: 'Measurements', id: patient_id },
      ],
    }),
    getMedications: build.query<Medications, string>({
      query: (patientId) => `/staff/patients/${patientId}/medications`,
      responseSchema: medicationsSchema,
      providesTags: (_result, _error, patientId) => [{ type: 'Medications', id: patientId }],
    }),
    // مش بيلغي الـCache: الشاشة هي اللي ماسكة القيم وهي بتتكتب
    saveMedications: build.mutation<Medications, MedicationsBody>({
      query: (body) => ({
        url: `/staff/patients/${body.patient_id}/medications`,
        method: 'PUT',
        body,
      }),
      responseSchema: medicationsSchema,
    }),
  }),
});

export const {
  useGetMeasurementsQuery,
  useAddVitalsMutation,
  useAddLabMutation,
  useGetMedicationsQuery,
  useSaveMedicationsMutation,
} = measurementsApi;
