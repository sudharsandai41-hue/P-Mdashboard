const fs = require('fs');

const dbPath = './src/lib/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Filter out all 3D Team tasks
db.tasks = db.tasks.filter(t => t.team !== "3D Team");

const members3D = [
  "GOWTHAM", "ANAND", "ARAVIND", "ARUN", "GANAVEL", 
  "MAHENDRAN", "RAVI CHANDRAN", "LOKESH", "MADHAN", "ANITHA"
];

const skills = [
  "SKILL 1 — AI & LLM Fundamentals",
  "SKILL 2 — Prompt Engineering for 3D Workflow",
  "SKILL 3 — AI Image Generation",
  "SKILL 4 — AI Video Generation",
  "SKILL 5 — AI in 3ds Max & Blender",
  "SKILL 6 — AI Texture Generation (Substance Painter)",
  "SKILL 7 — Local AI Setup (ComfyUI)",
  "SKILL 8 — AI-Powered Project Management & Documentation"
];

let taskIdCounter = 100; // start from 100 to avoid conflicts with Design team t1..t23

for (let member of members3D) {
  for (let skill of skills) {
    db.tasks.push({
      id: "t" + (taskIdCounter++),
      team: "3D Team",
      title: skill,
      assignedTo: member,
      status: "Pending",
      score: null,
      phase: "training",
      driveLink: "",
      feedback: "",
      updatedAt: ""
    });
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log("Seeded 80 3D team tasks successfully!");
