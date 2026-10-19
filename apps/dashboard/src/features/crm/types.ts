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

export const LOST_REASONS = [
  'price',
  'no_response',
  'competitor',
  'not_interested',
  'far',
  'other',
] as const;

export type LostReason = (typeof LOST_REASONS)[number];

export const CALL_OUTCOMES = [
  'no_answer',
  'interested',
  'not_interested',
  'callback',
  'wrong_number',
] as const;

export type CallOutcome = (typeof CALL_OUTCOMES)[number];

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
  // بعد التحويل لمريض ("حوّله لمريض")
  patient_id: z.string().nullable(),
  lost_reason: z.enum(LOST_REASONS).nullable(),
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

// سطر في تايم لاين الـLead (D-21): إنشاء · مكالمة · واتساب · ملاحظة · تغيير مرحلة · خسرناه · اتحوّل لمريض
export const leadActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['created', 'call', 'whatsapp', 'note', 'stage', 'lost', 'converted']),
  outcome: z.enum(CALL_OUTCOMES).nullable(),
  // اسم قالب الواتساب
  template: z.string().nullable(),
  stage: z.enum(LEAD_STAGES).nullable(),
  reason: z.enum(LOST_REASONS).nullable(),
  notes: z.string(),
  by: z.object(named).nullable(),
  at: z.string(),
});

export type LeadActivity = z.infer<typeof leadActivitySchema>;

export const whatsappTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  body_ar: z.string(),
  body_en: z.string(),
});

export type WhatsappTemplate = z.infer<typeof whatsappTemplateSchema>;

export type LogCallBody = { id: string; outcome: CallOutcome; notes: string };
export type SendWhatsappBody = { id: string; template_id: string };
export type MarkLostBody = { id: string; reason: LostReason; notes: string };
export type ConvertLeadBody = { id: string; gender: 'female' | 'male' };

export type MoveLeadBody = { id: string; stage: LeadStage };
