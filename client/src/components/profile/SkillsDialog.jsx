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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Skills</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Type a skill (comma separated for multiple)..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium"
              >
                {skill}
                <button
                  className="ml-1 text-yellow-900 hover:text-yellow-700 font-bold"
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
              className={`px-2 py-1 text-sm rounded-md transition ${
                selectedSkills.includes(skill)
                  ? "bg-yellow-200"
                  : "bg-gray-100 hover:bg-yellow-100"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        <Button onClick={handleAdd} className="mt-4">
          Add Skill
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsDialog;
