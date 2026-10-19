import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { Specialty } from '@oxygen/config';
import {
  LEAD_SOURCES,
  LEAD_STAGES,
  isManualStage,
  type Campaign,
  type CreateLeadBody,
  type Lead,
  type LeadStage,
} from '@/features/crm/types';
import { currentStaff, toMe } from './auth';
import { ensurePatients, pick, seeded } from './clinic';
import { readDb, writeDb, type MockDb } from './db';

/**
 * الـCRM الوهمي (6.1): 4 حملات و64 Lead موزّعين على المراحل والمصادر والـAgents.
 * الـLeads الجديدة (مرحلة Lead) أعمارها بالدقايق عشان الـSLA (أخضر · أصفر · أحمر) يبان.
 */
const DAY = 86_400_000;
const MINUTE = 60_000;

const AGENTS = [
  { id: 'st-crm', name_ar: 'ندى سمير', name_en: 'Nada Samir' },
  { id: 'agent-farah', name_ar: 'فرح علي', name_en: 'Farah Ali' },
  { id: 'agent-sara', name_ar: 'سارة أحمد', name_en: 'Sara Ahmed' },
  { id: 'agent-reem', name_ar: 'ريم السيد', name_en: 'Reem El Sayed' },
] as const;

const FIRST = [
  'أحمد',
  'محمد',
  'سارة',
  'منى',
  'هبة',
  'يوسف',
  'نور',
  'خالد',
  'دينا',
  'عمر',
  'ياسمين',
  'كريم',
  'مريم',
  'تامر',
  'ليلى',
  'حسن',
];
const LAST = [
  'حسن',
  'محمود',
  'إبراهيم',
  'سالم',
  'عادل',
  'فتحي',
  'مصطفى',
  'نبيل',
  'صلاح',
  'رمضان',
  'جمال',
  'الشريف',
];
const INTERESTS: Specialty[] = ['nutrition', 'physio', 'derm', 'internal'];
const BRANCHES = ['branch-new-cairo', 'branch-heliopolis'];

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-summer',
    name: 'Summer Weight Loss',
    channel: 'instagram',
    budget: 4_500_000,
    starts_on: '2026-09-15',
    ends_on: null,
  },
  {
    id: 'camp-back',
    name: 'Back Pain Awareness',
    channel: 'facebook',
    budget: 3_000_000,
    starts_on: '2026-10-01',
    ends_on: '2026-11-15',
  },
  {
    id: 'camp-glow',
    name: 'Glow Skin Offer',
    channel: 'tiktok',
    budget: 2_000_000,
    starts_on: '2026-10-05',
    ends_on: '2026-10-31',
  },
  {
    id: 'camp-checkup',
    name: 'Annual Checkup',
    channel: 'google',
    budget: 1_500_000,
    starts_on: '2026-09-01',
    ends_on: null,
  },
];

// الأكتر في الأول (Lead · Contacted) وبيقل مع الوقت
const WEIGHTS: Record<LeadStage, number> = {
  lead: 9,
  contacted: 9,
  qualified: 8,
  booked: 7,
  visited: 6,
  assessment: 5,
  program: 4,
  paid: 4,
  treatment: 4,
  follow_up: 3,
  renewal: 2,
  referral: 1,
};

// موبايل مصري عشوائي مش متكرر (مش عند Lead ولا مريض)
function uniquePhone(random: () => number, used: Set<string>): string {
  for (;;) {
    const phone = `+20${pick(random, ['10', '11', '12', '15'])}${String(Math.floor(random() * 1e8)).padStart(8, '0')}`;
    if (!used.has(phone)) {
      used.add(phone);
      return phone;
    }
  }
}

export function ensureLeads(db: MockDb) {
  if (db.campaigns.length === 0) db.campaigns = structuredClone(CAMPAIGNS);
  if (db.leads.length > 0) return;
  const random = seeded('oxygen-leads');
  const now = Date.now();
  const bag = LEAD_STAGES.flatMap((stage) => Array<LeadStage>(WEIGHTS[stage]).fill(stage));
  const phones = new Set(db.patients.map((item) => item.phone));

  db.leads = Array.from({ length: 64 }, (_, index) => {
    const stage = pick(random, bag);
    const phone = uniquePhone(random, phones);

    const created =
      isManualStage(stage) && stage === 'lead'
        ? now - Math.round(2 + random() * 170) * MINUTE
        : now - Math.round(1 + random() * 29) * DAY - Math.round(random() * 600) * MINUTE;
    const contactedAfter = Math.round(2 + random() * 110) * MINUTE;
    const campaign = random() < 0.7 ? pick(random, CAMPAIGNS) : null;
    const agent = pick(random, AGENTS);

    return {
      id: `lead-${index + 1}`,
      name: `${pick(random, FIRST)} ${pick(random, LAST)}`,
      phone,
      branch_id: pick(random, BRANCHES),
      source: pick(random, LEAD_SOURCES),
      campaign: campaign ? { id: campaign.id, name: campaign.name } : null,
      interest: pick(random, INTERESTS),
      assigned_to: { id: agent.id, name_ar: agent.name_ar, name_en: agent.name_en },
      stage,
      status: 'open' as const,
      notes: '',
      created_at: new Date(created).toISOString(),
      first_contacted_at:
        stage === 'lead' ? null : new Date(created + contactedAfter).toISOString(),
      last_activity_at: new Date(
        stage === 'lead' ? created : created + contactedAfter,
      ).toISOString(),
    };
  });
}

const can = (permission: 'leads.read' | 'leads.create' | 'leads.write') =>
  toMe(currentStaff()).permissions.includes(permission);

const visibleTo = (lead: Lead) => {
  const staff = currentStaff();
  return staff.all_branches || staff.branch_ids.includes(lead.branch_id);
};

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

export const crmHandlers: MockHandlers = {
  getLeads: (args: FetchArgs) => {
    if (!can('leads.read')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensurePatients);
    writeDb(ensureLeads);
    const { branch_id, source, campaign_id, assigned_to, days } = (args.params ?? {}) as Record<
      string,
      string | undefined
    >;
    const since = days ? Date.now() - Number(days) * DAY : 0;
    const data = readDb().leads.filter(
      (lead) =>
        lead.status === 'open' &&
        visibleTo(lead) &&
        (!branch_id || branch_id === 'all' || lead.branch_id === branch_id) &&
        (!source || lead.source === source) &&
        (!campaign_id || lead.campaign?.id === campaign_id) &&
        (!assigned_to || lead.assigned_to?.id === assigned_to) &&
        Date.parse(lead.created_at) >= since,
    );
    return { data };
  },

  getCampaigns: () => {
    if (!can('leads.read')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureLeads);
    return { data: readDb().campaigns };
  },

  getCrmAgents: () => {
    if (!can('leads.read')) throw new MockHttpError(403, 'FORBIDDEN');
    return { data: AGENTS.map((agent) => ({ ...agent })) };
  },

  createLead: ({ body }) => {
    if (!can('leads.create')) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as CreateLeadBody;
    if (!input.name.trim()) throw new MockHttpError(422, 'INVALID_LEAD');
    writeDb(ensurePatients);
    writeDb(ensureLeads);
    const staff = currentStaff();
    const now = new Date().toISOString();
    let created: Lead | null = null;
    writeDb((db) => {
      // منع التكرار برقم الموبايل (CRM-10): عند Lead أو مريض
      if (
        db.leads.some((lead) => lead.phone === input.phone) ||
        db.patients.some((patient) => patient.phone === input.phone)
      ) {
        throw new MockHttpError(409, 'DUPLICATE_PHONE');
      }
      const campaign = db.campaigns.find((item) => item.id === input.campaign_id);
      created = {
        id: `lead-new-${Date.now()}`,
        name: input.name.trim(),
        phone: input.phone,
        branch_id: input.branch_id,
        source: input.source,
        campaign: campaign ? { id: campaign.id, name: campaign.name } : null,
        interest: input.interest,
        assigned_to:
          staff.role === 'crm_agent'
            ? { id: staff.id, name_ar: staff.name_ar, name_en: staff.name_en }
            : null,
        stage: 'lead',
        status: 'open',
        notes: input.notes.trim(),
        created_at: now,
        first_contacted_at: null,
        last_activity_at: now,
      };
      db.leads.push(created);
    });
    return created!;
  },

  moveLeadStage: ({ url, body }) => {
    if (!can('leads.write')) throw new MockHttpError(403, 'FORBIDDEN');
    const { stage } = body as { stage: LeadStage };
    const id = idFrom(url, 2);
    writeDb(ensureLeads);
    writeDb((db) => {
      const lead = db.leads.find((item) => item.id === id);
      if (!lead) throw new MockHttpError(404, 'NOT_FOUND');
      // التحريك اليدوي بين Lead وContacted وQualified بس
      if (!isManualStage(stage) || !isManualStage(lead.stage))
        throw new MockHttpError(422, 'STAGE_AUTOMATIC');
      const now = new Date().toISOString();
      if (stage !== 'lead' && !lead.first_contacted_at) lead.first_contacted_at = now;
      lead.stage = stage;
      lead.last_activity_at = now;
    });
    return readDb().leads.find((item) => item.id === id)!;
  },
};
