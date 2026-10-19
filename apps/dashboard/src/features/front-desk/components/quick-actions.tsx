import { useState } from 'react';
import { Button, Card, Flex } from 'antd';
import { CalendarPlus, CreditCard, UserPlus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import type { Practitioner } from '@/features/appointments/types';
import { useCan } from '@/features/auth/use-me';
import { RegisterPatientDrawer } from '@/features/patients/components/register-patient-drawer';
import { clinicToday } from '@/lib/clinic-time';

type Props = { branchId: string; practitioners: Practitioner[] };

/**
 * الإجراءات السريعة (D-02): مريض جديد (3.3) · حجز جديد (3.2) · تحصيل (لحد 3.6 بيودّي للاستقبال).
 * بعد تسجيل مريض: "احجز له ميعاد" بيفتح الحجز والمريض متختار.
 */
export function QuickActions({ branchId, practitioners }: Props) {
  const { t } = useTranslation('frontDesk');
  const navigate = useNavigate();
  const canRegister = useCan('patients.write');
  const canBook = useCan('appointments.write');
  const [registering, setRegistering] = useState(false);
  const [booking, setBooking] = useState<BookingMode | null>(null);

  return (
    <Card title={t('quick.title')}>
      <Flex vertical gap={8}>
        {canRegister && (
          <Button
            size="large"
            icon={<UserPlus size={18} aria-hidden />}
            onClick={() => setRegistering(true)}
            style={{ justifyContent: 'flex-start' }}
          >
            {t('quick.newPatient')}
          </Button>
        )}
        {canBook && (
          <Button
            size="large"
            icon={<CalendarPlus size={18} aria-hidden />}
            onClick={() => setBooking({ kind: 'new', date: clinicToday() })}
            style={{ justifyContent: 'flex-start' }}
          >
            {t('quick.newBooking')}
          </Button>
        )}
        <Button
          size="large"
          icon={<CreditCard size={18} aria-hidden />}
          // التحصيل بيتبني في 20 · 3.6
          onClick={() => navigate({ to: '/front-desk' })}
          style={{ justifyContent: 'flex-start' }}
        >
          {t('quick.collect')}
        </Button>
      </Flex>
      <RegisterPatientDrawer
        open={registering}
        onClose={() => setRegistering(false)}
        onBook={(patient) => setBooking({ kind: 'new', date: clinicToday(), patient })}
      />
      <BookingModal
        mode={booking}
        branchId={branchId}
        practitioners={practitioners}
        onClose={() => setBooking(null)}
      />
    </Card>
  );
}
