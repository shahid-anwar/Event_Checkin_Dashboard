import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../store/authSlice";
import { toast } from "react-toastify";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/customers", label: "Customers" },
  { to: "/qr-scan", label: "QR Scan" },
  { to: "/booth-assignment", label: "Booth Assignment" },
  { to: "/customer-status", label: "Status Update" },
];
function HamburgerIcon() {
  return (
    <svg
      className="w-5 h-5 cursor-pointer"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-5 h-5 cursor-pointer"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function AppLayout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Check-In Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Event Operations</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => {
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 w-full text-sm bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md py-1.5 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar — hidden on mobile unless open, always visible on md+ */}
      <aside
        className={`
         fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col
         transform transition-transform duration-200 ease-in-out
         md:static md:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className=" flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
          <button
            onClick={toggleSidebar}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Open sidebar"
          >
            {sidebarOpen ? "" : <HamburgerIcon />}
          </button>
          <span className="text-sm font-semibold text-slate-800">
            Check-In Console
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
