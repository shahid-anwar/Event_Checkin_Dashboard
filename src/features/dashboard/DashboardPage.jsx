import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useGetDashboardSummaryQuery } from "../../api/dashboardApi";
import SummaryCard from "../../components/SummaryCard";
import { Loading, ErrorState } from "../../components/StateViews";

const COLORS = [
  "#f59e0b",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#10b981",
  "#ef4444",
  "#eab308",
];

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetDashboardSummaryQuery(
    undefined,
    {
      pollingInterval: 15000,
    },
  );

  if (isLoading) return <Loading label="Loading dashboard..." />;
  if (isError)
    return (
      <ErrorState
        message={error?.data?.message || "Failed to load dashboard summary."}
      />
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Live overview of customer check-in activity
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard
          label="Total Customers"
          value={data.totalCustomers}
          accent="indigo"
        />
        <SummaryCard label="Checked-In" value={data.checkedIn} accent="sky" />
        <SummaryCard label="Waiting" value={data.waiting} accent="amber" />
        <SummaryCard label="Assigned" value={data.assigned} accent="violet" />
        <SummaryCard
          label="Completed"
          value={data.completed}
          accent="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) =>
                  value > 0 ? `${name}: ${value}` : ""
                }
              >
                {data.statusDistribution.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
