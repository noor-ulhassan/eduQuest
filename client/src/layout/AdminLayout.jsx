import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, Code2, ArrowLeft } from "lucide-react";
import GamificationOverlay from "@/components/gamification/GamificationOverlay";

const NAV_ITEMS = [
  { to: "/admin",            label: "Overview",   icon: LayoutDashboard, end: true },
  { to: "/admin/courses",    label: "Courses",    icon: BookOpen },
  { to: "/admin/curriculum", label: "Playground", icon: Code2 },
];

const AdminLayout = () => (
  <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">
    {/* ── Sidebar ─────────────────────────────────────────────────── */}
    <aside className="w-56 flex-shrink-0 bg-[#0d0d0d] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="text-white font-bold text-base tracking-tight">EduQuest</span>
          <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-md leading-none">
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-white/5">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/5 transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          Back to Site
        </NavLink>
      </div>
    </aside>

    {/* ── Content area ────────────────────────────────────────────── */}
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>

    <GamificationOverlay />
  </div>
);

export default AdminLayout;
