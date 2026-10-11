import { baseApi } from '@/store/base-api';
import { bookingSchema, type Booking } from '@/types/booking';
import { myBookingsSchema, type RescheduleBody } from '@/types/portal';

/** مواعيد المريض (PP-02): الجاية واللي فاتت + إلغاء + تأجيل (بنفس الـSlotPicker بتاع الحجز). */
export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyBookings: build.query<Booking[], void>({
      query: () => '/me/bookings',
      rawResponseSchema: myBookingsSchema,
      transformResponse: (response: { data: Booking[] }) => response.data,
      providesTags: ['Appointments'],
    }),
    // 409 NOT_CANCELLABLE = الميعاد فات أو اتلغى قبل كده
    cancelBooking: build.mutation<Booking, string>({
      query: (id) => ({ url: `/bookings/${id}/cancel`, method: 'POST' }),
      responseSchema: bookingSchema,
      invalidatesTags: ['Appointments'],
    }),
    // 409 SLOT_TAKEN = الميعاد الجديد اتحجز
    rescheduleBooking: build.mutation<Booking, RescheduleBody>({
      query: ({ id, ...body }) => ({ url: `/bookings/${id}/reschedule`, method: 'POST', body }),
      responseSchema: bookingSchema,
      invalidatesTags: ['Appointments'],
    }),
  }),
});

export const { useGetMyBookingsQuery, useCancelBookingMutation, useRescheduleBookingMutation } =
  appointmentsApi;
