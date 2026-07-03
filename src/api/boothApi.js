import { apiSlice } from './apiSlice'

export const boothApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooths: builder.query({
      query: () => '/booths',
      providesTags: ['Booth'],
    }),
    getBoothAssignments: builder.query({
      query: () => '/boothAssignments',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'BoothAssignment', id })), { type: 'BoothAssignment', id: 'LIST' }]
          : [{ type: 'BoothAssignment', id: 'LIST' }],
    }),
    createBoothAssignment: builder.mutation({
      query: (payload) => ({
        url: '/boothAssignments',
        method: 'POST',
        body: { ...payload, createdAt: new Date().toISOString() },
      }),
      invalidatesTags: [{ type: 'BoothAssignment', id: 'LIST' }, { type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
    updateBoothAssignment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/boothAssignments/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: [{ type: 'BoothAssignment', id: 'LIST' }, { type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
    cancelBoothAssignment: builder.mutation({
      query: (id) => ({
        url: `/boothAssignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'BoothAssignment', id: 'LIST' }, { type: 'Customer', id: 'LIST' }, 'DashboardSummary'],
    }),
  }),
})

export const {
  useGetBoothsQuery,
  useGetBoothAssignmentsQuery,
  useCreateBoothAssignmentMutation,
  useUpdateBoothAssignmentMutation,
  useCancelBoothAssignmentMutation,
} = boothApi
