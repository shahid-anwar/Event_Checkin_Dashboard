import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useGetCustomersQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../../api/customerApi";
import { Loading, ErrorState, EmptyState } from "../../components/StateViews";
import StatusBadge from "../../components/StatusBadge";
import CustomerFormModal from "./CustomerFormModal";
import CustomerDetailsModal from "./CustomerDetailsModal";

const STATUS_OPTIONS = [
  "All",
  "Waiting",
  "Checked-In",
  "Assigned",
  "In Discussion",
  "Completed",
  "Not Interested",
  "Follow-Up Required",
];

export default function CustomerListPage() {
  const { data: customers, isLoading, isError, error } = useGetCustomersQuery();
  const [addCustomer, { isLoading: isAdding }] = useAddCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    if (!customers) return [];
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.mobile.includes(search);
      const matchesStatus =
        statusFilter === "All" || customer.eventStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer.id,
          ...editingCustomer,
          ...formData,
        }).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await addCustomer(formData).unwrap();
        toast.success("Customer added successfully");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save customer");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(deleteTarget.id).unwrap();
      toast.success("Customer deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500">
            Manage registered event customers
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2 cursor-pointer"
        >
          + Add Customer
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or mobile number..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <Loading label="Loading customers..." />
        ) : isError ? (
          <ErrorState
            message={error?.data?.message || "Failed to load customers."}
          />
        ) : filtered.length === 0 ? (
          <EmptyState message="No customers match your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Mobile</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Project</th>
                  <th className="text-left px-4 py-3">QR Code</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Booth</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {customer.mobile}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {customer.projectName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {customer.qrCode}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={customer.eventStatus} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {customer.assignedBooth || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingCustomer(customer)}
                          className="text-indigo-600 hover:underline text-xs font-medium cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-slate-600 hover:underline text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(customer)}
                          className="text-red-600 hover:underline text-xs font-medium cursor-pointer"
                        >
                          Delete
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

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCustomer}
        isSubmitting={isAdding || isUpdating}
      />

      <CustomerDetailsModal
        open={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-900">
              Delete customer?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              This will permanently remove{" "}
              <span className="font-medium">{deleteTarget.name}</span> from the
              system.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
