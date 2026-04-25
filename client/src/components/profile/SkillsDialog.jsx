import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SUGGESTED_SKILLS = [
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "TypeScript",
  "HTML",
  "CSS",
  "Tailwind",
];

const SkillsDialog = ({ open, onOpenChange, onAddSkill }) => {
  const [value, setValue] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const addSelectedSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setValue("");
  };

  const removeSelectedSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleAdd = () => {
    const inputSkills = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !selectedSkills.includes(s));

    const allSkills = [...selectedSkills, ...inputSkills];

    if (allSkills.length === 0) return;

    onAddSkill(allSkills);

    setSelectedSkills([]);
    setValue("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#121214] border-zinc-800/60 shadow-2xl text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight text-white">Add Skills</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Type a skill (comma separated)..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-zinc-900/60 text-white placeholder:text-zinc-500 border-zinc-800/60 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 transition-all font-medium py-5"
        />

        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/5 text-xs font-bold tracking-wide shadow-sm"
              >
                {skill}
                <button
                  className="ml-2 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => removeSelectedSkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTED_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => addSelectedSkill(skill)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                selectedSkills.includes(skill)
                  ? "bg-white text-black border-transparent shadow-sm"
                  : "bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        <Button onClick={handleAdd} className="mt-4 bg-white text-black hover:bg-zinc-200 font-bold rounded-full transition-colors w-full sm:w-auto self-end px-8">
          Add Skill
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsDialog;
