export function Loading({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="rounded-md bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
      {message}
    </div>
  )
}

export function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="text-center py-10 text-sm text-slate-400">{message}</div>
  )
}
