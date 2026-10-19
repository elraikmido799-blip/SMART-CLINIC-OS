import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { Specialty } from '@oxygen/config';
import type {
  Encounter,
  EncounterData,
  EncounterSummary,
  FormTemplate,
  TemplateField,
} from '@/features/encounters/types';
import { addDays, clinicDateOf, clinicToday } from '@/lib/clinic-time';
import { currentStaff } from './auth';
import { ensurePatients, pick, PRACTITIONERS, seeded, SERVICES } from './clinic';
import { readDb, writeDb, type MockDb } from './db';
import { ensureFormTemplates, publishedTemplateOf } from './form-templates';
import { TEMPLATES } from './templates';

/**
 * الكشوفات الوهمية (4.3): كشف لكل ميعاد، بيتحفظ مسودة وبيتوقّع في الـMock DB.
 * التشخيص والملاحظات القديمة متولّدة (seeded) لحد ما الكشوفات الحقيقية تتجمع.
 */
export type StoredEncounter = {
  id: string;
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  specialty: Specialty;
  status: 'draft' | 'signed';
  data: EncounterData;
  patient_visible: boolean;
  // النسخة المنشورة وقت بدء الكشف (التعديل بعد كده مش بيأثر عليه)
  template?: FormTemplate;
  created_at: string;
  updated_at: string;
  signed_at: string | null;
  signed_by: { name_ar: string; name_en: string } | null;
};

const DIAGNOSES = [
  ['إعادة بناء الرباط الصليبي — الركبة اليمين', 'Post-op ACL reconstruction — right knee'],
  ['آلام أسفل الظهر المزمنة', 'Chronic lower back pain'],
  ['خشونة الركبة', 'Knee osteoarthritis'],
  ['شد عضلي في الرقبة', 'Cervical muscle strain'],
] as const;

// ملاحظات الجلسات القديمة (متولّدة، بالعربي زي ما الدكتور بيكتب)
const NOTES = [
  'تحسّن في مدى الحركة، وألم أقل',
  'بدأنا تمارين السلسلة المغلقة',
  'تحمّل كويس للتمارين',
];

const isFilled = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const requiredKeys = (template: FormTemplate) =>
  template.sections
    .flatMap((section) => section.fields)
    .filter((field: TemplateField) => field.required)
    .map((field) => field.key);

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

function requireClinician() {
  const staff = currentStaff();
  if (!staff.specialty) throw new MockHttpError(403, 'FORBIDDEN');
  return staff;
}

function toEncounter(db: MockDb, stored: StoredEncounter): Encounter {
  const patient = db.patients.find((item) => item.id === stored.patient_id);
  if (!patient) throw new MockHttpError(404, 'NOT_FOUND');
  const practitioner = PRACTITIONERS.find((item) => item.id === stored.practitioner_id);
  const random = seeded(`encounter-${patient.id}`);
  const [diagnosisAr, diagnosisEn] = pick(random, DIAGNOSES);
  const signedBefore = db.encounters.filter(
    (item) =>
      item.patient_id === patient.id &&
      item.specialty === stored.specialty &&
      item.status === 'signed' &&
      item.id !== stored.id,
  );
  const base = 3 + Math.floor(random() * 4);
  const isPhysio = stored.specialty === 'physio';

  return {
    id: stored.id,
    status: stored.status,
    appointment_id: stored.appointment_id,
    specialty: stored.specialty,
    patient: {
      id: patient.id,
      name_ar: patient.name_ar,
      name_en: patient.name_en,
      file_no: patient.file_no,
      gender: patient.gender,
      birth_date: patient.birth_date,
      diagnosis_ar: isPhysio ? diagnosisAr : null,
      diagnosis_en: isPhysio ? diagnosisEn : null,
      session_number: isPhysio ? base + signedBefore.length + 1 : null,
      session_total: isPhysio ? 10 : null,
    },
    practitioner: {
      name_ar: practitioner?.name_ar ?? '',
      name_en: practitioner?.name_en ?? '',
    },
    template: stored.template ?? TEMPLATES[stored.specialty],
    data: stored.data,
    patient_visible: stored.patient_visible,
    updated_at: stored.updated_at,
    signed_at: stored.signed_at,
    signed_by: stored.signed_by,
    recent_notes: [
      // اللي اتوقّع فعلًا في المنظومة، وبعده القديم المتولّد
      ...signedBefore
        .sort((a, b) => (b.signed_at ?? '').localeCompare(a.signed_at ?? ''))
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          date: clinicDateOf(item.signed_at ?? item.created_at),
          session: null,
          text: typeof item.data.notes === 'string' ? item.data.notes : '',
        })),
      ...NOTES.map((text, index) => ({
        id: `old-${patient.id}-${index}`,
        date: addDays(clinicToday(), -7 * (index + 1)),
        session: isPhysio ? base - index : null,
        text,
      })),
    ].slice(0, 3),
  };
}

const summaryOf = (stored: StoredEncounter): EncounterSummary => {
  const practitioner = PRACTITIONERS.find((item) => item.id === stored.practitioner_id);
  const template = stored.template ?? TEMPLATES[stored.specialty];
  return {
    id: stored.id,
    date: clinicDateOf(stored.signed_at ?? stored.created_at),
    specialty: stored.specialty,
    template_title_ar: template.title_ar,
    template_title_en: template.title_en,
    practitioner: { name_ar: practitioner?.name_ar ?? '', name_en: practitioner?.name_en ?? '' },
    status: stored.status,
  };
};

const find = (db: MockDb, id: string) => {
  const stored = db.encounters.find((item) => item.id === id);
  if (!stored) throw new MockHttpError(404, 'NOT_FOUND');
  return stored;
};

export const encounterHandlers: MockHandlers = {
  startEncounter: ({ body }) => {
    const staff = requireClinician();
    const { appointment_id } = body as { appointment_id: string };
    writeDb(ensurePatients);
    let id = '';
    writeDb((db) => {
      const appointment = db.appointments.find((item) => item.id === appointment_id);
      if (!appointment) throw new MockHttpError(404, 'NOT_FOUND');
      const existing = db.encounters.find((item) => item.appointment_id === appointment_id);
      if (existing) {
        id = existing.id;
        return;
      }
      if (appointment.status !== 'checked_in') throw new MockHttpError(409, 'INVALID_STATUS');
      appointment.status = 'in_progress';
      ensureFormTemplates(db);
      const service = SERVICES.find((item) => item.id === appointment.service_id);
      const specialty = service?.specialty ?? staff.specialty ?? 'physio';
      const now = new Date().toISOString();
      id = `enc-${Date.now()}`;
      db.encounters.push({
        id,
        appointment_id,
        patient_id: appointment.patient_id,
        practitioner_id: appointment.practitioner_id || staff.id,
        specialty,
        template: structuredClone(publishedTemplateOf(db, specialty)),
        status: 'draft',
        data: {},
        patient_visible: false,
        created_at: now,
        updated_at: now,
        signed_at: null,
        signed_by: null,
      });
    });
    const db = readDb();
    return toEncounter(db, find(db, id));
  },

  getEncounter: ({ url }) => {
    writeDb(ensurePatients);
    const db = readDb();
    return toEncounter(db, find(db, idFrom(url, 1)));
  },

  saveEncounterDraft: ({ url, body }) => {
    requireClinician();
    const input = body as { data: EncounterData; patient_visible: boolean };
    const updated_at = new Date().toISOString();
    writeDb((db) => {
      const stored = find(db, idFrom(url, 2));
      if (stored.status === 'signed') throw new MockHttpError(409, 'ALREADY_SIGNED');
      stored.data = input.data;
      stored.patient_visible = input.patient_visible;
      stored.updated_at = updated_at;
    });
    return { updated_at };
  },

  signEncounter: ({ url, body }) => {
    const staff = requireClinician();
    const input = body as { data: EncounterData; patient_visible: boolean };
    const id = idFrom(url, 2);
    writeDb((db) => {
      const stored = find(db, id);
      if (stored.status === 'signed') throw new MockHttpError(409, 'ALREADY_SIGNED');
      const missing = requiredKeys(stored.template ?? TEMPLATES[stored.specialty]).filter(
        (key) => !isFilled(input.data[key]),
      );
      if (missing.length) throw new MockHttpError(422, 'REQUIRED_FIELDS');
      const now = new Date().toISOString();
      stored.data = input.data;
      stored.patient_visible = input.patient_visible;
      stored.status = 'signed';
      stored.signed_at = now;
      stored.updated_at = now;
      stored.signed_by = { name_ar: staff.name_ar, name_en: staff.name_en };
      const appointment = db.appointments.find((item) => item.id === stored.appointment_id);
      if (appointment) appointment.status = 'completed';
    });
    const db = readDb();
    return toEncounter(db, find(db, id));
  },

  getPatientEncounters: ({ url }) => {
    const patientId = idFrom(url, 2);
    const data = readDb()
      .encounters.filter((item) => item.patient_id === patientId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(summaryOf);
    return { data };
  },
};
