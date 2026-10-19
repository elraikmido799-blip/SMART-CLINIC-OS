import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

const specialty = z.custom<Specialty>(isSpecialty);
const named = { name_ar: z.string(), name_en: z.string() };

/**
 * مراحل الـPipeline الـ12 (docs/00 §7 · 07 §3). الـ3 الأولانيين **يدوي** (الـAgent بيسجّلهم)،
 * والـ9 الباقيين **تلقائي** من الأحداث (حجز · حضور · تقييم · برنامج · دفع…)، فمبيتسحبوش.
 */
export const LEAD_STAGES = [
  'lead',
  'contacted',
  'qualified',
  'booked',
  'visited',
  'assessment',
  'program',
  'paid',
  'treatment',
  'follow_up',
  'renewal',
  'referral',
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const MANUAL_STAGES: readonly LeadStage[] = ['lead', 'contacted', 'qualified'];

export const isManualStage = (stage: LeadStage) => MANUAL_STAGES.includes(stage);

// مصادر الـLead (CRM-01..08)
export const LEAD_SOURCES = [
  'facebook',
  'instagram',
  'tiktok',
  'website',
  'whatsapp',
  'phone',
  'referral',
  'walk_in',
  'other',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = ['open', 'won', 'lost'] as const;

export const CAMPAIGN_CHANNELS = [
  'facebook',
  'instagram',
  'tiktok',
  'google',
  'offline',
  'other',
] as const;

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  channel: z.enum(CAMPAIGN_CHANNELS),
  // بالقروش
  budget: z.number(),
  starts_on: z.string(),
  ends_on: z.string().nullable(),
});

export type Campaign = z.infer<typeof campaignSchema>;

/**
 * الـLead (D-20 · docs/20 · 6.1). الموبايل بيوصل كامل من الـAPI، والكارت بيعرضه مخفي جزئيًا (0101****23).
 * `first_contacted_at` هو اللي بيحدد الـSLA (أول رد في 15 دقيقة).
 */
export const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  branch_id: z.string(),
  source: z.enum(LEAD_SOURCES),
  campaign: z.object({ id: z.string(), name: z.string() }).nullable(),
  interest: specialty.nullable(),
  assigned_to: z.object({ id: z.string(), ...named }).nullable(),
  stage: z.enum(LEAD_STAGES),
  status: z.enum(LEAD_STATUSES),
  notes: z.string(),
  created_at: z.string(),
  first_contacted_at: z.string().nullable(),
  last_activity_at: z.string(),
});

export type Lead = z.infer<typeof leadSchema>;

export const agentSchema = z.object({ id: z.string(), ...named });

export type Agent = z.infer<typeof agentSchema>;

export type LeadQuery = {
  branch_id: string;
  source?: LeadSource;
  campaign_id?: string;
  assigned_to?: string;
  // آخر كام يوم (من غيرها = كل الوقت)
  days?: number;
};

export type CreateLeadBody = {
  name: string;
  // "+201XXXXXXXXX" (normalizeEgyptianMobile)
  phone: string;
  branch_id: string;
  source: LeadSource;
  campaign_id: string | null;
  interest: Specialty | null;
  notes: string;
};

export type MoveLeadBody = { id: string; stage: LeadStage };
