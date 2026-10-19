import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { LoginBody, LoginResponse, StaffMe, VerifyTwoFactorBody } from '@/features/auth/types';
import { readDb, writeDb } from './db';
import {
  LOCKED_EMAIL,
  MOCK_2FA_CODE,
  MOCK_PASSWORD,
  MAX_DISCOUNT,
  ROLE_TEMPLATES,
  STAFF,
  type MockStaff,
} from './seed';

const RESEND_AFTER_SECONDS = 45;

export const toMe = (staff: MockStaff): StaffMe => ({
  ...staff,
  permissions: ROLE_TEMPLATES[staff.role],
  max_discount_percent: MAX_DISCOUNT[staff.role] ?? 0,
});

export function currentStaff(): MockStaff {
  const { session } = readDb();
  const staff = session && STAFF.find((item) => item.id === session.staff_id);
  if (!staff) throw new MockHttpError(401, 'UNAUTHENTICATED');
  return staff;
}

// reception@oxygen.demo ← r*******n@oxygen.demo
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return `${name[0]}${'*'.repeat(Math.max(name.length - 2, 1))}${name.at(-1)}@${domain}`;
};

export const authHandlers: MockHandlers = {
  getMe: () => toMe(currentStaff()),

  login: ({ body }): LoginResponse => {
    const { email, password } = body as LoginBody;
    const normalized = email.trim().toLowerCase();
    if (normalized === LOCKED_EMAIL) throw new MockHttpError(423, 'ACCOUNT_LOCKED');

    const staff = STAFF.find((item) => item.email === normalized);
    if (!staff || password !== MOCK_PASSWORD) throw new MockHttpError(401, 'INVALID_CREDENTIALS');

    if (readDb().trusted_staff_ids.includes(staff.id)) {
      writeDb((db) => {
        db.session = { staff_id: staff.id };
      });
      return { two_factor: null, me: toMe(staff) };
    }

    const challengeId = crypto.randomUUID();
    writeDb((db) => {
      db.challenge = { id: challengeId, staff_id: staff.id };
    });
    return {
      two_factor: {
        challenge_id: challengeId,
        masked_email: maskEmail(staff.email),
        resend_after_seconds: RESEND_AFTER_SECONDS,
      },
      me: null,
    };
  },

  verifyTwoFactor: ({ body }) => {
    const { challenge_id, code, remember_device } = body as VerifyTwoFactorBody;
    const { challenge } = readDb();
    if (!challenge || challenge.id !== challenge_id)
      throw new MockHttpError(410, 'CHALLENGE_EXPIRED');
    if (code !== MOCK_2FA_CODE) throw new MockHttpError(422, 'INVALID_CODE');

    writeDb((db) => {
      db.session = { staff_id: challenge.staff_id };
      db.challenge = null;
      if (remember_device && !db.trusted_staff_ids.includes(challenge.staff_id)) {
        db.trusted_staff_ids.push(challenge.staff_id);
      }
    });
    return toMe(currentStaff());
  },

  resendTwoFactor: () => {
    if (!readDb().challenge) throw new MockHttpError(410, 'CHALLENGE_EXPIRED');
    return { resend_after_seconds: RESEND_AFTER_SECONDS };
  },

  logout: () => {
    writeDb((db) => {
      db.session = null;
    });
    return null;
  },
};
