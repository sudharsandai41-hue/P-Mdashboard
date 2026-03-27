"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client dynamically
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getDatabase() {
  // Fetch from Supabase Cloud
  const { data: teamsData } = await supabase.from('teams').select('*');
  const { data: tasksData } = await supabase.from('tasks').select('*');
  const { data: skillsData } = await supabase.from('skills').select('*');

  return {
    teams: teamsData || [],
    tasks: tasksData || [],
    skills: skillsData || []
  };
}

export async function updateScore(taskId: string, newScore: number) {
  const { error } = await supabase
    .from('tasks')
    .update({ 
       score: newScore, 
       status: "Scored",
       updatedAt: new Date().toISOString()
    })
    .eq('id', taskId);

  if (error) console.error("Database Error:", error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/main-dashboard");
  revalidatePath("/member-dashboard");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const assignedTo = formData.get("assignedTo") as string;
  const team = formData.get("team") as string;
  const driveLink = formData.get("driveLink") as string;
  const type = (formData.get("type") as string) || "task";

  const newTask = {
    id: "t_" + Date.now().toString(),
    team,
    title,
    assignedTo,
    status: "Review",
    score: null,
    driveLink: driveLink || "",
    feedback: "",
    updatedAt: new Date().toISOString(),
    type
  };

  const { error } = await supabase.from('tasks').insert([newTask]);
  if (error) console.error("Error creating task:", error.message);

  revalidatePath("/admin");
  revalidatePath("/member-dashboard");
  revalidatePath("/main-dashboard");
}

export async function bulkAddTasks(formData: FormData) {
  const title = formData.get("title") as string;
  const driveLink = formData.get("driveLink") as string;
  const type = (formData.get("type") as string) || "task";
  const members = formData.getAll("assignedTo") as string[]; 
  
  if (!members || members.length === 0) return;

  const { data: teamsData } = await supabase.from('teams').select('*');
  
  const newTasks = members.map(member => {
    const tData = teamsData?.find(t => t.members.includes(member));
    const team = tData ? tData.name : "General";
    
    return {
      id: "t_" + Date.now().toString() + "_" + Math.random().toString(36).substring(7),
      team,
      title,
      assignedTo: member,
      status: "Review",
      score: null,
      driveLink: driveLink || "",
      feedback: "",
      updatedAt: new Date().toISOString(),
      type
    };
  });

  const { error } = await supabase.from('tasks').insert(newTasks);
  if (error) console.error("Error bulk creating tasks:", error.message);

  revalidatePath("/admin");
  revalidatePath("/member-dashboard");
  revalidatePath("/main-dashboard");
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) console.error("Error deleting task:", error.message);
  
  revalidatePath("/admin");
  revalidatePath("/main-dashboard");
  revalidatePath("/member-dashboard");
}

export async function addSkill(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const newSkill = {
    id: "s_" + Date.now().toString(),
    title,
    description: description || ""
  };

  const { error } = await supabase.from('skills').insert([newSkill]);
  if (error) console.error("Error adding skill:", error.message);

  revalidatePath("/admin");
}

export async function deleteSkill(skillId: string) {
  const { error } = await supabase.from('skills').delete().eq('id', skillId);
  if (error) console.error("Error deleting skill:", error.message);

  revalidatePath("/admin");
}

export async function updateSkill(skillId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from('skills')
    .update({ title, description })
    .eq('id', skillId);

  if (error) console.error("Error updating skill:", error.message);

  revalidatePath("/admin");
}

export async function submitFeedback(taskId: string, feedback: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ feedback })
    .eq('id', taskId);

  if (error) console.error("Feedback Error:", error.message);

  revalidatePath("/member-dashboard");
  revalidatePath("/admin");
}

export async function validateLogin(role: string, userId: string): Promise<boolean> {
  if (role === "CEO" && userId.toLowerCase() === "sidd") return true;
  if (role === "Admin" && userId.toLowerCase() === "sudharsan") return true;
  
  const { data: team } = await supabase
    .from('teams')
    .select('members')
    .eq('name', role)
    .single();
  
  if (!team || !team.members) return false;
  
  // Check if member exists in the team roster in Supabase
  return team.members.some((member: string) => member.toLowerCase() === userId.toLowerCase());
}
