import { apiSlice } from './apiSlice'

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: () => '/customers',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Customer', id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    addCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: '/customers',
        method: 'POST',
        body: {
          ...newCustomer,
          qrCode: `QR-${Date.now()}`,
          qrUsed: false,
          eventStatus: 'Waiting',
          assignedBooth: null,
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, { type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi
