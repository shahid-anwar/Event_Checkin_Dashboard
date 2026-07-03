import { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetBoothAssignmentsQuery,
  useGetBoothsQuery,
  useCreateBoothAssignmentMutation,
  useUpdateBoothAssignmentMutation,
  useCancelBoothAssignmentMutation,
} from "../../api/boothApi";
import { useGetCustomersQuery } from "../../api/customerApi";
import { Loading, ErrorState, EmptyState } from "../../components/StateViews";
import StatusBadge from "../../components/StatusBadge";
import BoothAssignmentModal from "./BoothAssignmentModal";

export default function BoothAssignmentPage() {
  const {
    data: assignments,
    isLoading,
    isError,
  } = useGetBoothAssignmentsQuery();
  const { data: customers } = useGetCustomersQuery();
  const { data: booths } = useGetBoothsQuery();
  const [createAssignment, { isLoading: isCreating }] =
    useCreateBoothAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] =
    useUpdateBoothAssignmentMutation();
  const [cancelAssignment] = useCancelBoothAssignmentMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Checked-in customers available for assignment
  const checkedInCustomers =
    customers?.filter((customer) => customer.eventStatus === "Checked-In") ||
    [];

  // Booths currently occupied by active assignments
  const occupiedBooths =
    assignments
      ?.filter((assignment) =>
        ["Assigned", "In Discussion"].includes(assignment.status),
      )
      .map((assignment) => assignment.boothNumber) || [];

  const availableBooths =
    booths?.filter((booth) => !occupiedBooths.includes(booth.boothNumber)) ||
    [];
  const handleCreate = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      // Prevent double-booking a booth (unless editing the same record)
      const isBoothTaken = assignments?.some(
        (assignment) =>
          assignment.boothNumber === formData.boothNumber &&
          ["Assigned", "In Discussion"].includes(assignment.status) &&
          assignment.id !== editingAssignment?.id,
      );
      if (isBoothTaken) {
        toast.error(
          `Booth ${formData.boothNumber} is already assigned to an active customer.`,
        );
        return;
      }

      if (editingAssignment) {
        await updateAssignment({
          id: editingAssignment.id,
          ...editingAssignment,
          ...formData,
        }).unwrap();
        toast.success("Assignment updated");
      } else {
        const customer = customers.find(
          (customer) => customer.id === formData.customerId,
        );
        await createAssignment({
          ...formData,
          customerName: customer?.name,
        }).unwrap();
        toast.success("Booth assigned successfully");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save assignment");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelAssignment(cancelTarget.id).unwrap();
      toast.success("Assignment cancelled");
      setCancelTarget(null);
    } catch {
      toast.error("Failed to cancel assignment");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Booth Assignment
          </h2>
          <p className="text-sm text-slate-500">
            Assign checked-in customers to available booths
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={checkedInCustomers.length === 0}
          title={
            checkedInCustomers.length === 0
              ? "No checked-in customers available"
              : ""
          }
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2 cursor-pointer"
        >
          + New Assignment
        </button>
      </div>

      {checkedInCustomers.length === 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3">
          No customers are currently in <strong>Checked-In</strong> status.
          Check in customers first via the QR Scan page.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-semibold text-indigo-600">
            {booths?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Booths</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-semibold text-emerald-600">
            {availableBooths.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Available</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-semibold text-amber-600">
            {occupiedBooths.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Occupied</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <Loading label="Loading assignments..." />
        ) : isError ? (
          <ErrorState message="Failed to load booth assignments." />
        ) : !assignments?.length ? (
          <EmptyState message="No booth assignments yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Booth</th>
                  <th className="text-left px-4 py-3">Sales Manager</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Assigned At</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {a.customerName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs font-mono font-medium px-2 py-1 rounded">
                        {a.boothNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {a.salesManagerName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(a)}
                          className="text-indigo-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setCancelTarget(a)}
                          className="text-red-600 hover:underline text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BoothAssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingAssignment}
        checkedInCustomers={checkedInCustomers}
        availableBooths={availableBooths}
        allBooths={booths || []}
        isSubmitting={isCreating || isUpdating}
      />

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-900">
              Cancel assignment?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              This will free up booth{" "}
              <strong>{cancelTarget.boothNumber}</strong> and remove{" "}
              <strong>{cancelTarget.customerName}</strong>'s assignment.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100"
              >
                Keep
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Cancel Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
