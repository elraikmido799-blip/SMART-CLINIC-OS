import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type {
  AddLabBody,
  AddVitalsBody,
  Lab,
  Medications,
  MedicationsBody,
  Vital,
} from '@/features/measurements/types';
import { addDays, clinicToday } from '@/lib/clinic-time';
import { currentStaff } from './auth';
import { seeded } from './clinic';
import { readDb, writeDb } from './db';

/**
 * القياسات الوهمية (4.8): 6 قراءات أسبوعية وتحاليل متولّدة لكل مريض (نفس المريض = نفس الداتا)،
 * وأي قراءة أو تحليل بيتضاف بيتخزن في الـMock DB ويتحط معاهم.
 */
const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const LABS = [
  { name: 'HbA1c', unit: '%', min: 4, max: 5.7, base: 5.5, spread: 1.4 },
  { name: 'Fasting glucose', unit: 'mg/dL', min: 70, max: 100, base: 95, spread: 30 },
  { name: 'Total cholesterol', unit: 'mg/dL', min: null, max: 200, base: 195, spread: 50 },
  { name: 'Hemoglobin', unit: 'g/dL', min: 12, max: 16, base: 13.5, spread: 3 },
  { name: 'Vitamin D', unit: 'ng/mL', min: 30, max: 100, base: 28, spread: 20 },
] as const;

const vitalsOf = (patientId: string): Vital[] => {
  const random = seeded(`vitals-${patientId}`);
  const today = clinicToday();
  const height = 1.58 + random() * 0.25;
  let weight = 70 + random() * 25;
  return Array.from({ length: 6 }, (_, index) => {
    weight -= random() * 0.8;
    return {
      id: `vit-${patientId}-${index}`,
      date: addDays(today, -7 * (5 - index)),
      systolic: Math.round(112 + random() * 28),
      diastolic: Math.round(68 + random() * 18),
      heart_rate: Math.round(64 + random() * 24),
      weight_kg: round(weight),
      bmi: round(weight / (height * height)),
    };
  });
};

const labsOf = (patientId: string): Lab[] => {
  const random = seeded(`labs-${patientId}`);
  const today = clinicToday();
  return LABS.map((item, index) => ({
    id: `lab-${patientId}-${index}`,
    date: addDays(today, -14 - index * 3),
    name: item.name,
    value: round(item.base + (random() - 0.5) * item.spread, item.unit === '%' ? 1 : 0),
    unit: item.unit,
    min: item.min,
    max: item.max,
  }));
};

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

function requireRole(...allowed: string[]) {
  const staff = currentStaff();
  if (!allowed.includes(staff.role)) throw new MockHttpError(403, 'FORBIDDEN');
}

const inRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

export const measurementHandlers: MockHandlers = {
  getMeasurements: ({ url }) => {
    const patientId = idFrom(url, 2);
    const db = readDb();
    const vitals = [
      ...vitalsOf(patientId),
      ...db.vitals.filter((item) => item.patient_id === patientId),
    ]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-8);
    const labs = [
      ...labsOf(patientId),
      ...db.labs.filter((item) => item.patient_id === patientId),
    ].sort((a, b) => b.date.localeCompare(a.date));
    return { vitals, labs };
  },

  addVitals: ({ url, body }) => {
    requireRole('assistant', 'doctor', 'nutritionist', 'physiotherapist');
    const patientId = idFrom(url, 2);
    const input = body as Omit<AddVitalsBody, 'patient_id'>;
    if (
      !inRange(input.systolic, 60, 260) ||
      !inRange(input.diastolic, 30, 160) ||
      !inRange(input.heart_rate, 30, 220) ||
      !inRange(input.weight_kg, 20, 300)
    ) {
      throw new MockHttpError(422, 'INVALID_VALUE');
    }
    const height = 1.58 + seeded(`vitals-${patientId}`)() * 0.25;
    const vital: Vital & { patient_id: string } = {
      id: `vit-new-${Date.now()}`,
      patient_id: patientId,
      date: clinicToday(),
      ...input,
      bmi: round(input.weight_kg / (height * height)),
    };
    writeDb((db) => {
      db.vitals.push(vital);
    });
    return vital;
  },

  addLab: ({ url, body }) => {
    requireRole('doctor', 'nutritionist', 'physiotherapist');
    const patientId = idFrom(url, 2);
    const input = body as Omit<AddLabBody, 'patient_id'>;
    if (!input.name.trim() || !Number.isFinite(input.value))
      throw new MockHttpError(422, 'INVALID_VALUE');
    const lab: Lab & { patient_id: string } = {
      id: `lab-new-${Date.now()}`,
      patient_id: patientId,
      ...input,
      name: input.name.trim(),
    };
    writeDb((db) => {
      db.labs.push(lab);
    });
    return lab;
  },

  getMedications: ({ url }) => {
    const patientId = idFrom(url, 2);
    const stored = readDb().medications.find((item) => item.patient_id === patientId);
    const empty: Medications = { patient_id: patientId, medications: [], updated_at: null };
    return stored ?? empty;
  },

  saveMedications: ({ url, body }) => {
    requireRole('doctor', 'nutritionist', 'physiotherapist');
    const patientId = idFrom(url, 2);
    const record: Medications = {
      ...(body as MedicationsBody),
      patient_id: patientId,
      updated_at: new Date().toISOString(),
    };
    writeDb((db) => {
      db.medications = [...db.medications.filter((item) => item.patient_id !== patientId), record];
    });
    return record;
  },
};
