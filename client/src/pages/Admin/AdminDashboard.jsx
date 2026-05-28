import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BookOpen, Code2, ArrowRight, Link2 } from "lucide-react";

const CARDS = [
  {
    route: "/admin/courses",
    icon: BookOpen,
    accent: "indigo",
    title: "Course Management",
    description:
      "Create, edit, and publish AI-generated courses. Control visibility, manage chapter content, and shape the learning journey for students.",
    cta: "Manage Courses",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    iconText: "text-indigo-400",
    hoverBorder: "hover:border-indigo-500/40",
    glow: "from-indigo-600/8",
    ctaText: "text-indigo-400",
  },
  {
    route: "/admin/curriculum",
    icon: Code2,
    accent: "emerald",
    title: "Playground Curriculum",
    description:
      "Build and organise coding problems per language. Structure them into chapters and attach exercises to course chapters for end-of-chapter practice.",
    cta: "Manage Curriculum",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconText: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/40",
    glow: "from-emerald-600/8",
    ctaText: "text-emerald-400",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-full p-8 bg-[#0a0a0a]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-zinc-500 text-sm mb-1">
          Welcome back,{" "}
          <span className="text-zinc-300">{user?.name || "Admin"}</span>
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Admin Panel
        </h1>
        <p className="text-zinc-500 mt-1.5 text-sm">
          Manage course content and playground curriculum for students.
        </p>
      </div>

      {/* ── Feature cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CARDS.map(
          ({
            route,
            icon: Icon,
            title,
            description,
            cta,
            iconBg,
            iconText,
            hoverBorder,
            glow,
            ctaText,
          }) => (
            <button
              key={route}
              onClick={() => navigate(route)}
              className={`group relative bg-[#111] border border-white/[0.07] rounded-2xl p-7 text-left transition-all duration-300 overflow-hidden ${hoverBorder}`}
            >
              {/* Hover glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative">
                {/* Icon + arrow row */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-3 rounded-xl border ${iconBg}`}>
                    <Icon size={22} className={iconText} />
                  </div>
                  <ArrowRight
                    size={17}
                    className={`mt-1 text-zinc-600 group-hover:${ctaText} group-hover:translate-x-1 transition-all duration-200`}
                  />
                </div>

                <h2 className="text-lg font-semibold text-white mb-2">
                  {title}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {description}
                </p>

                <div className={`mt-6 flex items-center gap-1.5 ${ctaText} text-sm font-medium`}>
                  <span>{cta}</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              </div>
            </button>
          )
        )}
      </div>

      {/* ── Info strip ──────────────────────────────────────────────── */}
      <div className="mt-6 flex items-start gap-3 px-5 py-4 rounded-xl bg-[#111] border border-white/5">
        <Link2 size={14} className="text-zinc-600 flex-shrink-0 mt-0.5" />
        <p className="text-zinc-600 text-xs leading-relaxed">
          Courses and Playground Curriculum are connected — coding problems from
          a playground chapter can be attached to a course chapter so students
          get hands-on exercises at the end of each lesson.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
