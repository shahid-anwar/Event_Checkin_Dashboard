import { apiSlice } from './apiSlice'

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => '/dashboard-summary',
      providesTags: ['DashboardSummary'],
    }),
  }),
})

export const { useGetDashboardSummaryQuery } = dashboardApi
