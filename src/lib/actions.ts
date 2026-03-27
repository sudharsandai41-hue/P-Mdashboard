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

  return {
    teams: teamsData || [],
    tasks: tasksData || []
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

  const newTask = {
    id: "t_" + Date.now().toString(),
    team,
    title,
    assignedTo,
    status: "Review",
    score: null,
    driveLink: driveLink || "",
    feedback: "",
    updatedAt: new Date().toISOString()
  };

  const { error } = await supabase.from('tasks').insert([newTask]);
  if (error) console.error("Error creating task:", error.message);

  revalidatePath("/admin");
  revalidatePath("/member-dashboard");
  revalidatePath("/main-dashboard");
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
