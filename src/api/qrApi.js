import { apiSlice } from './apiSlice'

export const qrApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    verifyQrCode: builder.query({
      query: (qrCode) => `/qr-codes/verify/${qrCode}`,
    }),
    checkInCustomer: builder.mutation({
      query: (qrCode) => ({
        url: '/customers/check-in',
        method: 'POST',
        body: { qrCode },
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
  }),
})

export const { useLazyVerifyQrCodeQuery, useCheckInCustomerMutation } = qrApi
