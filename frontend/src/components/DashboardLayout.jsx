import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#eef2f8] text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
            <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight text-[#2157d8]">
              Xchango
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              Logout
            </button>
          </div>

          <nav className="space-y-2 px-4 pb-6 lg:px-5">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isActive ? "bg-[#eaf0ff] text-[#2157d8]" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/send"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isActive ? "bg-[#eaf0ff] text-[#2157d8]" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              Send Money
            </NavLink>
            <NavLink
              to="/dashboard/history"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isActive ? "bg-[#eaf0ff] text-[#2157d8]" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              History
            </NavLink>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isActive ? "bg-[#eaf0ff] text-[#2157d8]" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              Profile
            </NavLink>
          </nav>

          <div className="hidden px-5 pb-6 lg:block">
            <div className="rounded-2xl border border-[#d9e3ff] bg-[#f5f8ff] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">User</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{user?.name}</p>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-lg bg-[#2157d8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1948b8]"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main>
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {location.pathname === "/dashboard" && "Dashboard"}
                {location.pathname === "/dashboard/send" && "Send Money"}
                {location.pathname === "/dashboard/history" && "History"}
                {location.pathname === "/dashboard/profile" && "Profile"}
              </h1>
              <p className="text-xs text-slate-500">Secure currency exchange workspace</p>
            </div>

            <Link
              to="/dashboard/send"
              className="rounded-lg bg-[#2157d8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1948b8]"
            >
              Send Money
            </Link>
          </header>

          <section className="px-4 py-6 lg:px-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
