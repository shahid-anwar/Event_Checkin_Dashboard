import { apiSlice } from './apiSlice'

export const statusApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateCustomerStatus: builder.mutation({
      query: (payload) => ({
        url: '/customer-status',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: 'StatusHistory', id: payload.customerId },
        { type: 'Customer', id: 'LIST' },
        'DashboardSummary',
      ],
    }),
    getCustomerStatusHistory: builder.query({
      query: (customerId) => `/customer-status/${customerId}`,
      providesTags: (result, error, customerId) => [{ type: 'StatusHistory', id: customerId }],
    }),
  }),
})

export const { useUpdateCustomerStatusMutation, useGetCustomerStatusHistoryQuery } = statusApi
