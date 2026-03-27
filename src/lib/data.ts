export const designTeamMembers = [
  "AJISH", "DINESH", "NEHA", "RAVI", "RUBI", "SANTOSH", 
  "TEJU", "YALINI", "SANJANA", "INDRA", "SHAKTHI", "ABDUL"
];

export const threeDTeamMembers = [
  "GOWTHAM", "ANAND", "ARAVIND", "ARUN", "GANAVEL", 
  "MAHENDRAN", "RAVI CHANDRAN", "LOKESH", "MADHAN", "ANITHA"
];

export const mockTasks = [
  {
    id: "task-1",
    title: "Session 1 — AI Tools Overview & LLM Integration",
    team: "3D Team",
    assignedTo: "GOWTHAM",
    status: "Completed",
    type: "Training",
    aiScore: 94,
    description: "Practical: Using LLM in daily 3D workflow\nProject briefs & client communication\nFolder structure automation",
  },
  {
    id: "task-2",
    title: "Session 2 — Image & Video Generation in 3D Pipeline",
    team: "3D Team",
    assignedTo: "GOWTHAM",
    status: "In Progress",
    type: "Training",
    aiScore: null,
    description: "Image generation tools (Midjourney, DALL-E, Stable Diffusion — comparison)...",
  },
  {
    id: "task-3",
    title: "Moodboard Review",
    team: "Design Team",
    assignedTo: "AJISH",
    status: "Review",
    type: "Project",
    aiScore: 82,
    description: "Design concept for client X...",
  }
];

export const mockAIAnalysis = async (content: string) => {
  return new Promise((resolve) => setTimeout(() => {
    resolve({
      score: Math.floor(Math.random() * 20) + 80, // Random 80-100 score
      feedback: "Good prompt structure. Could be refined with more specific lighting parameters.",
      status: "Evaluated"
    });
  }, 1500));
};
