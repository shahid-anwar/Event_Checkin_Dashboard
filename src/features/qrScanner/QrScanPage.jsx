import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import {
  useLazyVerifyQrCodeQuery,
  useCheckInCustomerMutation,
} from "../../api/qrApi";
import { Loading } from "../../components/StateViews";
import StatusBadge from "../../components/StatusBadge";

const SCANNER_ELEMENT_ID = "qr-reader";

export default function QrScanPage() {
  const [manualCode, setManualCode] = useState("");
  const [scannedCustomer, setScannedCustomer] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);

  const [triggerVerify, { isFetching: isVerifying }] =
    useLazyVerifyQrCodeQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInCustomerMutation();

  const scannerRef = useRef(null);

  const handleVerify = async (code) => {
    setVerifyError(null);
    setScannedCustomer(null);
    try {
      const result = await triggerVerify(code).unwrap();
      setScannedCustomer(result.customer);
    } catch (err) {
      const msg = err?.data?.message || "Invalid or unrecognized QR code.";
      setVerifyError(msg);
      if (err?.data?.customer) setScannedCustomer(err.data.customer);
      toast.error(msg);
    }
  };

  const startScanner = async () => {
    setScannerActive(true);
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = html5Qr;
        await html5Qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            await html5Qr.stop();
            setScannerActive(false);
            handleVerify(decodedText);
          },
          () => {},
        );
      } catch (err) {
        toast.error("Could not access camera. Use manual entry instead.");
        setScannerActive(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {}
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleVerify(manualCode.trim());
  };

  const handleCheckIn = async () => {
    try {
      const result = await checkIn(scannedCustomer.qrCode).unwrap();
      setScannedCustomer(result.customer);
      toast.success("Customer checked in successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Check-in failed");
    }
  };

  const alreadyUsed =
    scannedCustomer &&
    (scannedCustomer.eventStatus === "Checked-In" || scannedCustomer.qrUsed) &&
    !verifyError === false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          QR Scan & Check-In
        </h2>
        <p className="text-sm text-slate-500">
          Scan a customer's QR code or enter it manually to verify and check
          them in
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-medium text-slate-700">Camera Scan</h3>
          <div
            id={SCANNER_ELEMENT_ID}
            className="w-full min-h-[220px] bg-slate-100 rounded-lg overflow-hidden"
          />
          {!scannerActive ? (
            <button
              onClick={startScanner}
              className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white text-sm font-medium rounded-md py-2.5"
            >
              Start Camera Scan
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-md py-2.5"
            >
              Stop Scanning
            </button>
          )}

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              Manual Entry
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. QR-C2-002"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md px-4"
              >
                Verify
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Verification Result
          </h3>

          {isVerifying ? (
            <Loading label="Verifying QR code..." />
          ) : verifyError && !scannedCustomer ? (
            <div className="rounded-md bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
              {verifyError}
            </div>
          ) : scannedCustomer ? (
            <div className="space-y-3">
              {verifyError && (
                <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2">
                  {verifyError}
                </div>
              )}
              <dl className="space-y-2">
                {[
                  ["Name", scannedCustomer.name],
                  ["Mobile", scannedCustomer.mobile],
                  ["Email", scannedCustomer.email],
                  ["Project", scannedCustomer.projectName],
                  ["QR Code", scannedCustomer.qrCode],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between text-sm border-b border-slate-100 pb-2"
                  >
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-900 font-medium">{value}</dd>
                  </div>
                ))}
                <div className="flex justify-between text-sm pb-2 items-center">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusBadge status={scannedCustomer.eventStatus} />
                  </dd>
                </div>
              </dl>

              {scannedCustomer.eventStatus === "Checked-In" ||
              scannedCustomer.qrUsed ? (
                <p className="text-sm text-emerald-600 font-medium">
                  ✓ Already checked in
                </p>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2.5"
                >
                  {isCheckingIn ? "Checking in..." : "Confirm Check-In"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Scan or enter a QR code to see customer details here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
