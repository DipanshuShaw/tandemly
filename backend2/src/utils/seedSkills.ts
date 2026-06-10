import mongoose from "mongoose";
import dotenv from "dotenv";

import Skill from "../models/Skill";

dotenv.config();

const skills = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },

  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "Spring Boot", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "Flask", category: "Backend" },

  { name: "MongoDB", category: "Database" },
  { name: "MySQL", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Redis", category: "Database" },

  { name: "Java", category: "Programming" },
  { name: "Python", category: "Programming" },
  { name: "C", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "C#", category: "Programming" },

  { name: "Data Structures", category: "Computer Science" },
  { name: "Algorithms", category: "Computer Science" },
  { name: "Operating Systems", category: "Computer Science" },
  { name: "DBMS", category: "Computer Science" },
  { name: "Computer Networks", category: "Computer Science" },

  { name: "Git", category: "DevOps" },
  { name: "GitHub", category: "DevOps" },
  { name: "Docker", category: "DevOps" },
  { name: "AWS", category: "DevOps" },

  { name: "Machine Learning", category: "AI" },
  { name: "Deep Learning", category: "AI" },
  { name: "Prompt Engineering", category: "AI" },

  { name: "English", category: "Language" },
  { name: "Hindi", category: "Language" },
  { name: "German", category: "Language" },
  { name: "French", category: "Language" },
  { name: "Spanish", category: "Language" },

  { name: "Photography", category: "Creative" },
  { name: "Video Editing", category: "Creative" },
  { name: "Graphic Design", category: "Creative" },
  { name: "Figma", category: "Creative" },
  { name: "UI/UX Design", category: "Creative" },

  { name: "Resume Building", category: "Career" },
  { name: "Interview Preparation", category: "Career" },
  { name: "Public Speaking", category: "Career" },
];

const seedSkills = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI!
    );

    await Skill.insertMany(
      skills,
      { ordered: false }
    );

    console.log(
      "Skills seeded successfully"
    );

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSkills();