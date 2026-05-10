import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";

const chartConfig = {
  skills: {
    label: "Skill Level",
    color: "#8c2bee",
  },
};

const DEFAULT_DATA = [
  { subject: "Logic", A: 85, fullMark: 100 },
  { subject: "Syntax", A: 70, fullMark: 100 },
  { subject: "Design", A: 90, fullMark: 100 },
  { subject: "Speed", A: 65, fullMark: 100 },
  { subject: "Testing", A: 50, fullMark: 100 },
];

/**
 * SkillsDialog (now SkillAnalysis)
 *
 * Props:
 *  - skills: string[] | { name: string, level: number }[]
 *    Plain strings default to 75% on the bars.
 *    Leave empty to show default placeholder data.
 */
const SkillsDialog = ({ skills = [] }) => {
  const radarData =
    skills.length > 0
      ? skills.slice(0, 6).map((s) => ({
          subject: typeof s === "string" ? s : s.name,
          A: typeof s === "object" && s.level != null ? s.level : 75,
          fullMark: 100,
        }))
      : DEFAULT_DATA;

  const barData =
    skills.length > 0
      ? skills.slice(0, 6).map((s) => ({
          name: typeof s === "string" ? s : s.name,
          value: typeof s === "object" && s.level != null ? s.level : 75,
        }))
      : DEFAULT_DATA.map((d) => ({ name: d.subject, value: d.A }));

  return (
    <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50">
      <h4 className="font-bold mb-4 text-metallic">Skill Analysis</h4>

      <div className="h-48 w-full -ml-2">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#334155" opacity={0.5} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Radar
              dataKey="A"
              stroke="#8c2bee"
              fill="#8c2bee"
              fillOpacity={0.3}
              dot={{ r: 3, fillOpacity: 1 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
          </RadarChart>
        </ChartContainer>
      </div>

      {/* <div className="mt-4 space-y-3">
        {barData.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                {item.name}
              </span>
              <span className="text-xs font-bold text-purple-400">
                {item.value}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.value}%`,
                  background: "linear-gradient(90deg, #8c2bee, #a855f7)",
                }}
              />
            </div>
          </div>
        ))}
      </div> */}
    </section>
  );
};

export default SkillsDialog;
