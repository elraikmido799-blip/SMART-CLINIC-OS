import { baseApi } from '@/store/base-api';
import {
  bookingSchema,
  slotsResponseSchema,
  type Booking,
  type CreateBookingBody,
  type SlotsQuery,
  type SlotsResponse,
} from '@/types/booking';

/**
 * الحجوزات: المواعيد الفاضية + إنشاء حجز + حجز واحد.
 * هنا مش في book/_api لأن الدفع (/checkout) والبوابة (التأجيل بنفس الـSlotPicker) بيستخدموه كمان (DEC-38).
 */
export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSlots: build.query<SlotsResponse, SlotsQuery>({
      query: (params) => ({ url: '/public/slots', params }),
      responseSchema: slotsResponseSchema,
      // المواعيد بتتغير بسرعة: كل دقيقة
      keepUnusedDataFor: 60,
    }),
    createBooking: build.mutation<Booking, CreateBookingBody>({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      responseSchema: bookingSchema,
      invalidatesTags: ['Appointments'],
    }),
    getBooking: build.query<Booking, string>({
      query: (id) => `/bookings/${id}`,
      responseSchema: bookingSchema,
      providesTags: (_result, _error, id) => [{ type: 'Appointments', id }],
    }),
  }),
});

export const { useGetSlotsQuery, useCreateBookingMutation, useGetBookingQuery } = bookingsApi;
