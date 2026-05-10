import { Lock } from "lucide-react";

const DEFAULT_ACHIEVEMENTS = [
  { title: "Bug Hunter", image: "/badges/bug.png" },
  { title: "Fast Typer", image: "/badges/fasttyper.png" },
  { title: "Rocket Start", image: "/badges/rocket.png" },
  { title: "Code Wizard", image: "/badges/wizard.png" },
];

const Achievements = ({ achievements = [], userBadges = [] }) => {
  const normalized =
    achievements.length > 0
      ? achievements.map((ach) => ({
          title: ach.title,
          image: ach.image,
          unlocked:
            ach.unlocked !== undefined
              ? ach.unlocked
              : userBadges.includes(ach.title),
        }))
      : DEFAULT_ACHIEVEMENTS.map((def) => ({
          ...def,
          unlocked: userBadges.includes(def.title),
        }));

  return (
    <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-metallic">Achievements</h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {normalized.map((ach, i) => (
          <div
            key={i}
            className={`flex flex-col items-center text-center group ${
              ach.unlocked ? "cursor-pointer" : "opacity-40"
            }`}
          >
            <div className="w-30 h-30 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 overflow-hidden">
              {ach.unlocked && ach.image ? (
                <img
                  src={ach.image}
                  alt={ach.title}
                  className="3-20 h-30 object-contain"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                  <Lock className="text-zinc-400 w-7 h-7" />
                </div>
              )}
            </div>
            <p
              className={`text-xs font-bold ${!ach.unlocked ? "text-zinc-500" : "text-white"}`}
            >
              {ach.title}
            </p>
            {ach.unlocked && (
              <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-red-400/70">
                Unlocked
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Achievements;
