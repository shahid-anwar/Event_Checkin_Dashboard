import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  boothNumber: z.string().min(1, 'Please select a booth'),
  salesManagerName: z.string().min(2, 'Sales manager name is required'),
  status: z.enum(['Waiting', 'Assigned', 'In Discussion', 'Completed', 'Cancelled']),
})

const STATUS_OPTIONS = ['Waiting', 'Assigned', 'In Discussion', 'Completed', 'Cancelled']

export default function BoothAssignmentModal({
  open, onClose, onSubmit, initialData, checkedInCustomers, availableBooths, allBooths, isSubmitting,
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { customerId: '', boothNumber: '', salesManagerName: '', status: 'Assigned' },
  })

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? { customerId: initialData.customerId, boothNumber: initialData.boothNumber, salesManagerName: initialData.salesManagerName, status: initialData.status }
          : { customerId: '', boothNumber: '', salesManagerName: '', status: 'Assigned' }
      )
    }
  }, [open, initialData, reset])

  if (!open) return null

  // When editing, show all booths; when creating, only show available ones
  const boothOptions = initialData ? allBooths : availableBooths

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {initialData ? 'Edit Assignment' : 'New Booth Assignment'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
            {initialData ? (
              <input value={initialData.customerName} disabled className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" />
            ) : (
              <select {...register('customerId')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select a checked-in customer…</option>
                {checkedInCustomers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.mobile}</option>
                ))}
              </select>
            )}
            {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Booth Number</label>
            <select {...register('boothNumber')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a booth…</option>
              {boothOptions.map((b) => (
                <option key={b.id} value={b.boothNumber}>{b.boothNumber}</option>
              ))}
            </select>
            {errors.boothNumber && <p className="text-xs text-red-600 mt-1">{errors.boothNumber.message}</p>}
            {!initialData && boothOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No booths currently available.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sales Manager Name</label>
            <input {...register('salesManagerName')} placeholder="e.g. Vikram Singh" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.salesManagerName && <p className="text-xs text-red-600 mt-1">{errors.salesManagerName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select {...register('status')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-md">
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Assign Booth'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
