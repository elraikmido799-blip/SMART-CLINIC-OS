import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import {
  LEAD_STAGES,
  type Lead,
  type LeadActivity,
  type LeadStage,
  type LogCallBody,
  type MarkLostBody,
  type WhatsappTemplate,
} from '@/features/crm/types';
import { currentStaff, toMe } from './auth';
import { seeded } from './clinic';
import { ensureLeads } from './crm';
import { readDb, writeDb, type MockDb } from './db';

/**
 * نشاط الـLead الوهمي (6.2): التايم لاين (مكالمات · واتساب · تغيير مراحل) + الإجراءات (مكالمة · واتساب ·
 * خسرناه · حوّله لمريض). التايم لاين بيتولّد من مرحلة الـLead ومواعيده، وأي إجراء جديد بيتخزن ويتحط معاه.
 */
export type StoredActivity = LeadActivity & { lead_id: string };

const DAY = 86_400_000;

export const WHATSAPP_TEMPLATES: WhatsappTemplate[] = [
  {
    id: 'tpl-welcome',
    name: 'Welcome message + services',
    body_ar: 'أهلًا بيك في أوكسجين! دي خدماتنا وأقرب موعد متاح لك.',
    body_en: 'Welcome to Oxygen! Here are our services and the nearest available slot.',
  },
  {
    id: 'tpl-prices',
    name: 'Prices and packages',
    body_ar: 'ده جدول الأسعار والباقات اللي تناسب حالتك.',
    body_en: 'Here is our price list and the packages that fit your case.',
  },
  {
    id: 'tpl-followup',
    name: 'Follow-up reminder',
    body_ar: 'حبينا نطمّن عليك ونشوف لو حابب نحجزلك ميعاد.',
    body_en: 'We wanted to check in and see if you would like us to book you an appointment.',
  },
];

const staffName = () => {
  const staff = currentStaff();
  return { name_ar: staff.name_ar, name_en: staff.name_en };
};

const can = (permission: 'leads.read' | 'leads.write') =>
  toMe(currentStaff()).permissions.includes(permission);

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

const entry = (
  lead_id: string,
  id: string,
  at: string,
  type: LeadActivity['type'],
  patch: Partial<LeadActivity> = {},
): StoredActivity => ({
  id,
  lead_id,
  type,
  outcome: null,
  template: null,
  stage: null,
  reason: null,
  notes: '',
  by: null,
  at,
  ...patch,
});

// تايم لاين قديم متولّد من مرحلة الـLead (إنشاء · أول تواصل · انتقالات المراحل)
function seedHistory(lead: Lead): StoredActivity[] {
  const random = seeded(`activity-${lead.id}`);
  const created = Date.parse(lead.created_at);
  const events: StoredActivity[] = [
    entry(lead.id, `${lead.id}-created`, lead.created_at, 'created'),
  ];
  if (lead.first_contacted_at) {
    events.push(
      random() < 0.5
        ? entry(lead.id, `${lead.id}-call`, lead.first_contacted_at, 'call', {
            outcome: 'interested',
            by: lead.assigned_to,
          })
        : entry(lead.id, `${lead.id}-wa`, lead.first_contacted_at, 'whatsapp', {
            template: WHATSAPP_TEMPLATES[0].name,
            by: lead.assigned_to,
          }),
    );
  }
  // كل مرحلة بعد Contacted بتتسجّل بتاريخ بين أول تواصل ودلوقتي
  const reached = LEAD_STAGES.indexOf(lead.stage);
  const span = Math.max(DAY, Date.now() - created);
  for (let index = 1; index <= reached; index++) {
    const stage = LEAD_STAGES[index];
    events.push(
      entry(
        lead.id,
        `${lead.id}-stage-${stage}`,
        new Date(created + (span * index) / (reached + 1)).toISOString(),
        'stage',
        { stage },
      ),
    );
  }
  return events;
}

/** الحجز بيحرّك الـLead لـ"حجز" لوحده (مرحلة تلقائية) لو مريضه اتحجزله ميعاد */
export function advanceLeadsOnBooking(db: MockDb, patientId: string) {
  const booked = LEAD_STAGES.indexOf('booked');
  for (const lead of db.leads) {
    if (lead.patient_id !== patientId || LEAD_STAGES.indexOf(lead.stage) >= booked) continue;
    const now = new Date().toISOString();
    lead.stage = 'booked';
    lead.last_activity_at = now;
    db.lead_activities.push(
      entry(lead.id, `act-${Date.now()}-booked`, now, 'stage', { stage: 'booked' }),
    );
  }
}

// أول تواصل: بيسجّل الوقت (الـSLA) وبينقل الـLead اليدوي لـ"اتكلّمنا معاه"
function touch(db: MockDb, lead: Lead, now: string) {
  if (!lead.first_contacted_at) lead.first_contacted_at = now;
  if (lead.stage === 'lead') {
    lead.stage = 'contacted';
    db.lead_activities.push(
      entry(lead.id, `act-${Date.now()}-stage`, now, 'stage', { stage: 'contacted' as LeadStage }),
    );
  }
  lead.last_activity_at = now;
}

const leadOf = (db: MockDb, id: string) => {
  const found = db.leads.find((item) => item.id === id);
  if (!found) throw new MockHttpError(404, 'NOT_FOUND');
  return found;
};

export const crmActivityHandlers: MockHandlers = {
  getLeadActivities: ({ url }) => {
    if (!can('leads.read')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureLeads);
    const db = readDb();
    const lead = leadOf(db, idFrom(url, 2));
    const stored = db.lead_activities.filter((item) => item.lead_id === lead.id);
    const data = [...seedHistory(lead), ...stored].sort((a, b) => b.at.localeCompare(a.at));
    return { data };
  },

  getWhatsappTemplates: () => ({ data: WHATSAPP_TEMPLATES }),

  logLeadCall: ({ url, body }) => {
    if (!can('leads.write')) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as Omit<LogCallBody, 'id'>;
    const id = idFrom(url, 2);
    writeDb(ensureLeads);
    writeDb((db) => {
      const lead = leadOf(db, id);
      const now = new Date().toISOString();
      db.lead_activities.push(
        entry(id, `act-${Date.now()}`, now, 'call', {
          outcome: input.outcome,
          notes: input.notes.trim(),
          by: staffName(),
        }),
      );
      touch(db, lead, now);
    });
    return readDb().leads.find((item) => item.id === id)!;
  },

  sendLeadWhatsapp: ({ url, body }) => {
    if (!can('leads.write')) throw new MockHttpError(403, 'FORBIDDEN');
    const { template_id } = body as { template_id: string };
    const template = WHATSAPP_TEMPLATES.find((item) => item.id === template_id);
    if (!template) throw new MockHttpError(422, 'INVALID_TEMPLATE');
    const id = idFrom(url, 2);
    writeDb(ensureLeads);
    writeDb((db) => {
      const lead = leadOf(db, id);
      const now = new Date().toISOString();
      db.lead_activities.push(
        entry(id, `act-${Date.now()}`, now, 'whatsapp', {
          template: template.name,
          by: staffName(),
        }),
      );
      touch(db, lead, now);
    });
    return readDb().leads.find((item) => item.id === id)!;
  },

  markLeadLost: ({ url, body }) => {
    if (!can('leads.write')) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as Omit<MarkLostBody, 'id'>;
    const id = idFrom(url, 2);
    writeDb(ensureLeads);
    writeDb((db) => {
      const lead = leadOf(db, id);
      const now = new Date().toISOString();
      lead.status = 'lost';
      lead.lost_reason = input.reason;
      lead.last_activity_at = now;
      db.lead_activities.push(
        entry(id, `act-${Date.now()}`, now, 'lost', {
          reason: input.reason,
          notes: input.notes.trim(),
          by: staffName(),
        }),
      );
    });
    return readDb().leads.find((item) => item.id === id)!;
  },

  convertLead: ({ url, body }) => {
    if (!can('leads.write')) throw new MockHttpError(403, 'FORBIDDEN');
    const { gender } = body as { gender: 'female' | 'male' };
    const id = idFrom(url, 2);
    writeDb(ensureLeads);
    writeDb((db) => {
      const lead = leadOf(db, id);
      if (lead.patient_id) return;
      if (db.patients.some((patient) => patient.phone === lead.phone))
        throw new MockHttpError(409, 'DUPLICATE_PHONE');
      const index = db.patients.length;
      const patient = {
        id: `pat-${index + 1}`,
        name_ar: lead.name,
        name_en: lead.name,
        file_no: `OXY-${String(100 + index).padStart(6, '0')}`,
        phone: lead.phone,
        gender,
        birth_date: '',
        branch_id: lead.branch_id,
        balance_due: 0,
      };
      db.patients.push(patient);
      lead.patient_id = patient.id;
      const now = new Date().toISOString();
      lead.last_activity_at = now;
      db.lead_activities.push(
        entry(id, `act-${Date.now()}`, now, 'converted', { by: staffName() }),
      );
    });
    return readDb().leads.find((item) => item.id === id)!;
  },
};
