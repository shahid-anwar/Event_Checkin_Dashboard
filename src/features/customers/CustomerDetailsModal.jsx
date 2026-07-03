export default function CustomerDetailsModal({ open, onClose, customer }) {
  if (!open || !customer) return null

  const rows = [
    ['Customer Name', customer.name],
    ['Mobile Number', customer.mobile],
    ['Email', customer.email],
    ['Project Name', customer.projectName],
    ['QR Code', customer.qrCode],
    ['QR Used', customer.qrUsed ? 'Yes' : 'No'],
    ['Event Status', customer.eventStatus],
    ['Assigned Booth', customer.assignedBooth || '—'],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Details</h3>
        <dl className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm border-b border-slate-100 pb-2">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-slate-900 font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
