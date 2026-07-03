import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useGetCustomersQuery } from "../../api/customerApi";
import {
  useUpdateCustomerStatusMutation,
  useGetCustomerStatusHistoryQuery,
} from "../../api/statusApi";
import { Loading, ErrorState, EmptyState } from "../../components/StateViews";
import StatusBadge from "../../components/StatusBadge";

const STATUS_OPTIONS = [
  "Waiting",
  "Checked-In",
  "Assigned",
  "In Discussion",
  "Completed",
  "Not Interested",
  "Follow-Up Required",
];

const schema = z
  .object({
    customerId: z.string().min(1, "Please select a customer"),
    status: z.string().min(1, "Please select a status"),
    remarks: z.string().optional(),
    followUpDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Follow-Up Required" && !data.followUpDate)
        return false;
      return true;
    },
    {
      message: "Follow-up date is required for this status",
      path: ["followUpDate"],
    },
  );

export default function CustomerStatusPage() {
  const { data: customers, isLoading: loadingCustomers } =
    useGetCustomersQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateCustomerStatusMutation();
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: history, isLoading: loadingHistory } =
    useGetCustomerStatusHistoryQuery(selectedCustomerId, {
      skip: !selectedCustomerId,
    });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: "",
      status: "",
      remarks: "",
      followUpDate: "",
    },
  });

  const watchedCustomerId = watch("customerId");
  const watchedStatus = watch("status");

  useEffect(() => {
    setSelectedCustomerId(watchedCustomerId);
    if (watchedCustomerId && customers) {
      const c = customers.find((c) => c.id === watchedCustomerId);
      if (c) setValue("status", c.eventStatus);
    }
  }, [watchedCustomerId, customers, setValue]);

  const onSubmit = async (formData) => {
    try {
      await updateStatus({
        customerId: formData.customerId,
        status: formData.status,
        remarks: formData.remarks,
        followUpDate:
          formData.status === "Follow-Up Required"
            ? formData.followUpDate
            : null,
      }).unwrap();
      toast.success("Status updated successfully");
      reset();
      setSelectedCustomerId("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const selectedCustomer = customers?.find((c) => c.id === watchedCustomerId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Customer Status Update
        </h2>
        <p className="text-sm text-slate-500">
          Update event status and view the history trail for any customer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4 ">
            Update Status
          </h3>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Customer
              </label>
              {loadingCustomers ? (
                <Loading label="Loading..." />
              ) : (
                <select
                  {...register("customerId")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a customer…</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.eventStatus})
                    </option>
                  ))}
                </select>
              )}
              {errors.customerId && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            {selectedCustomer && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                <span className="text-slate-600">
                  {selectedCustomer.mobile} · {selectedCustomer.projectName}
                </span>
                <StatusBadge status={selectedCustomer.eventStatus} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Status
              </label>
              <select
                {...register("status")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select status…</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                {...register("remarks")}
                rows={3}
                placeholder="Add notes about this status change…"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {watchedStatus === "Follow-Up Required" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Follow-Up Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("followUpDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.followUpDate && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.followUpDate.message}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2.5 cursor-pointer"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </form>
        </div>

        {/* Status History */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Status History{" "}
            {selectedCustomer ? `— ${selectedCustomer.name}` : ""}
          </h3>

          {!selectedCustomerId ? (
            <EmptyState message="Select a customer to view their status history." />
          ) : loadingHistory ? (
            <Loading label="Loading history..." />
          ) : !history?.length ? (
            <EmptyState message="No status history found for this customer." />
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              <ul className="space-y-4 pl-8">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <div className="absolute -left-5 mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white" />
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <StatusBadge status={h.status} />
                        <span className="text-xs text-slate-400">
                          {new Date(h.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      {h.remarks && (
                        <p className="text-sm text-slate-600 mt-1">
                          {h.remarks}
                        </p>
                      )}
                      {h.followUpDate && (
                        <p className="text-xs text-orange-600 mt-1 font-medium">
                          📅 Follow-up:{" "}
                          {new Date(h.followUpDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
