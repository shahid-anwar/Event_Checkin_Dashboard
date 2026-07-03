const STATUS_STYLES = {
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  'Checked-In': 'bg-sky-50 text-sky-700 border-sky-200',
  Assigned: 'bg-violet-50 text-violet-700 border-violet-200',
  'In Discussion': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  'Not Interested': 'bg-slate-100 text-slate-600 border-slate-200',
  'Follow-Up Required': 'bg-orange-50 text-orange-700 border-orange-200',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${style}`}>
      {status}
    </span>
  )
}
