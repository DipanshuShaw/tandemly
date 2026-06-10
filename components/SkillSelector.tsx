"use client";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";

interface Skill {
  _id: string;
  name: string;
  category: string;
}

interface Props {
  skills: Skill[];
  selectedSkill: string;
  onSelect: (
    skillId: string
  ) => void;
}

export default function SkillSelector({
  skills,
  selectedSkill,
  onSelect,
}: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Command>
        <CommandInput
          placeholder="Search skills..."
          className="w-full p-3 outline-none border-b"
        />

        <CommandList className="max-h-56 overflow-y-auto">
          {skills.map((skill) => (
            <CommandItem
              key={skill._id}
              value={skill.name}
              onSelect={() =>
                onSelect(skill._id)
              }
              className={`p-3 cursor-pointer hover:bg-secondary ${
                selectedSkill ===
                skill._id
                  ? "bg-secondary"
                  : ""
              }`}
            >
              {skill.name}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}