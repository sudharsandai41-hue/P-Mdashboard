import Link from "next/link";
import Logo from "@/components/Logo";
import { getDatabase, updateScore, addTask, bulkAddTasks, deleteTask, updateTask, addSkill, deleteSkill, updateSkill } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";
import EditableSkillRow from "@/components/EditableSkillRow";
import EditableTaskRow from "@/components/EditableTaskRow";
import AdminInboxFilters from "@/components/AdminInboxFilters";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string, search?: string, team?: string, status?: string, type?: string, sort?: string, page?: string }> }) {
  const db = await getDatabase();
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "inbox";
  
  // --- INBOX FILTERING LOGIC ---
  let filteredTasks = [...db.tasks];

  const q = resolvedParams.search?.toLowerCase();
  if (q) {
     filteredTasks = filteredTasks.filter(t => 
       t.title.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q)
     );
  }
  if (resolvedParams.team) {
     filteredTasks = filteredTasks.filter(t => t.team === resolvedParams.team);
  }
  if (resolvedParams.status) {
     filteredTasks = filteredTasks.filter(t => t.status === resolvedParams.status);
  }
  if (resolvedParams.type) {
     filteredTasks = filteredTasks.filter(t => resolvedParams.type === 'task' ? (!t.type || t.type === 'task') : t.type === resolvedParams.type);
  }
  
  const sortParam = resolvedParams.sort || "latest";
  filteredTasks.sort((a, b) => {
     if (sortParam === "latest") {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
     } else if (sortParam === "oldest") {
        return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
     } else if (sortParam === "score_high") {
        return (b.score || 0) - (a.score || 0);
     } else if (sortParam === "score_low") {
        const scoreA = a.score !== null ? a.score : Infinity;
        const scoreB = b.score !== null ? b.score : Infinity;
        return scoreA - scoreB;
     }
     return 0;
  });

  const ITEMS_PER_PAGE = 15;
  const currentPage = parseInt(resolvedParams.page || "1", 10) || 1;
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


  // --- SHARED ALL TASKS TABLE ---
  const membersList = db.teams.flatMap((t: any) => t.members);

  const allAssignedTasksTable = (
    <div className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight text-brand-text mb-2">All Assigned Pipeline</h2>
      
      <AdminInboxFilters totalPages={totalPages} currentPage={currentPage} />

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-brand-bg text-brand-muted text-xs border-b border-brand-border">
            <tr>
               <th className="p-3 font-bold uppercase tracking-wider">Task Title</th>
               <th className="p-3 font-bold uppercase tracking-wider">Assigned To</th>
               <th className="p-3 font-bold uppercase tracking-wider">Team</th>
               <th className="p-3 font-bold uppercase tracking-wider">Type</th>
               <th className="p-3 font-bold uppercase tracking-wider">Status</th>
               <th className="p-3 font-bold uppercase tracking-wider">Drive Link</th>
               <th className="p-3 font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-sm">
             {paginatedTasks.map((task: any) => (
                <EditableTaskRow 
                   key={task.id} 
                   task={task} 
                   updateAction={updateTask.bind(null, task.id)}
                   deleteAction={deleteTask.bind(null, task.id)}
                   membersList={membersList}
                />
             ))}
             {paginatedTasks.length === 0 && (
               <tr>
                 <td colSpan={7} className="p-4 text-center text-brand-muted font-bold">No tasks assigned yet.</td>
               </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex bg-brand-bg text-brand-text h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-border p-6 flex flex-col gap-4 bg-brand-card shadow-sm hidden md:flex h-full overflow-y-auto">
        <div className="scale-75 origin-top-left mb-2">
           <Logo />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-brand-muted text-sm">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/admin?tab=overview" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'overview' ? 'bg-[#E6D4AA]/30 text-brand-text border border-[#E6D4AA]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>Overview</Link>
          <Link href="/admin?tab=members" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'members' ? 'bg-[#C8B6E2]/30 text-brand-text border border-[#C8B6E2]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>Team Members</Link>
          <Link href="/admin?tab=inbox" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'inbox' ? 'bg-[#BCE2C2]/30 text-brand-text border border-[#BCE2C2]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>AI Scoring Inbox</Link>
          
          <div className="my-1 border-t border-brand-border"></div>
          
          <Link href="/admin?tab=tasks" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'tasks' ? 'bg-[#F3C4D6]/30 text-brand-text border border-[#F3C4D6]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>+ Assign Task</Link>
          <Link href="/admin?tab=bulk-tasks" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'bulk-tasks' ? 'bg-[#F3C4D6]/30 text-brand-text border border-[#F3C4D6]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>+ Bulk Assign Task</Link>

          <div className="my-1 border-t border-brand-border"></div>

          <Link href="/admin?tab=skills" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'skills' ? 'bg-[#A9CBE2]/30 text-brand-text border border-[#A9CBE2]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>Manage Skills</Link>
          <Link href="/admin?tab=assign-skills" className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'assign-skills' ? 'bg-[#A9CBE2]/30 text-brand-text border border-[#A9CBE2]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>+ Assign Skills</Link>
        </nav>
        <div className="mt-auto pt-4 border-t border-brand-border">
          <Link href="/" className="px-4 py-3 hover:bg-red-50 hover:text-red-600 rounded-lg w-full text-left transition block text-brand-muted font-bold">Logout</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 h-full overflow-y-auto">
        
        {activeTab === "inbox" && (
          <div>
            <header className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">AI Evaluation Inbox</h1>
            </header>

            <AdminInboxFilters totalPages={totalPages} currentPage={currentPage} />

            <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-brand-bg text-brand-muted text-xs border-b border-brand-border">
                  <tr>
                    <th className="p-3 font-bold uppercase tracking-wider">Team Member</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Submission Task</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Modify AI Score</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-sm">
                  {paginatedTasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-brand-bg transition">
                      <td className="p-3 font-bold">{task.assignedTo} <span className="font-normal text-brand-muted ml-2 text-xs">({task.team})</span></td>
                      <td className="p-3 font-medium text-sm">
                        {task.type === 'skill' ? <span className="bg-[#A9CBE2]/20 text-[#5A87A8] px-2 py-0.5 rounded text-[10px] mr-2 border border-[#A9CBE2]/50 font-bold uppercase tracking-widest">Skill</span> : null}
                        {task.title}
                      </td>
                      <td className="p-3">
                        {task.status === "Scored" ? (
                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold">Scored</span>
                        ) : (
                          <span className="px-3 py-1 bg-[#F7E7A6]/50 text-amber-800 rounded-lg text-xs font-bold">Review</span>
                        )}
                      </td>
                      <td className="p-3">
                        <form 
                          action={async (formData) => {
                             "use server"
                             const score = parseInt(formData.get("score") as string, 10);
                             if (!isNaN(score)) {
                                await updateScore(task.id, score);
                             }
                          }}
                          className="flex items-center gap-2"
                        >
                          <input 
                            type="number" 
                            name="score"
                            defaultValue={task.score !== null ? task.score : ""} 
                            placeholder="N/A"
                            min="0"
                            max="100"
                            className="w-16 p-1.5 border border-brand-border rounded-lg bg-brand-input font-bold text-center text-sm"
                          />
                          <button type="submit" className="px-3 py-1.5 bg-[#C8B6E2] hover:bg-[#b09bc9] text-white font-bold rounded-lg transition shadow-sm text-xs">
                            Save
                          </button>
                        </form>
                      </td>
                      <td className="p-3">
                         <DeleteButton action={deleteTask.bind(null, task.id)} />
                      </td>
                    </tr>
                  ))}
                  {paginatedTasks.length === 0 && (
                     <tr>
                        <td colSpan={5} className="p-6 text-center text-brand-muted font-bold">No tasks found globally with current filters.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Assign Task (Single) --- */}
        {activeTab === "tasks" && (
           <div>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">Assign New Task</h1>
            </header>
            
            <div className="bg-brand-card p-8 border border-brand-border rounded-2xl max-w-2xl shadow-sm">
               <form action={addTask} className="space-y-6">
                 <input type="hidden" name="type" value="task" />
                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Task Title</label>
                   <input required name="title" type="text" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="Describe the task..." />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-brand-muted mb-2">Team</label>
                     <select name="team" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium appearance-none">
                       <option value="Design Team">Design Team</option>
                       <option value="3D Team">3D Team</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-brand-muted mb-2">Assign To Member</label>
                     <select name="assignedTo" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium appearance-none">
                       {membersList.map((member: string) => (
                           <option key={member} value={member}>{member}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Google Drive Link (Optional)</label>
                   <input name="driveLink" type="url" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="https://drive.google.com/..." />
                 </div>

                 <button type="submit" className="w-full py-4 bg-[#F3C4D6] hover:bg-[#e4aec2] text-[#c24f79] font-bold rounded-xl transition shadow-sm">
                   Create & Assign Task
                 </button>
               </form>
            </div>

            {allAssignedTasksTable}
           </div>
        )}

        {/* --- Bulk Assign Task --- */}
        {activeTab === "bulk-tasks" && (
           <div>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">Bulk Assign Task</h1>
              <p className="text-brand-muted mt-2">Deploy a single identical task across multiple members instantly.</p>
            </header>
            
            <div className="bg-brand-card p-8 border border-brand-border rounded-2xl max-w-2xl shadow-sm">
               <form action={bulkAddTasks} className="space-y-6">
                 <input type="hidden" name="type" value="task" />
                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Task Title</label>
                   <input required name="title" type="text" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="Describe the task..." />
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Google Drive Link (Optional)</label>
                   <input name="driveLink" type="url" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="https://drive.google.com/..." />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Select Members</label>
                   <div className="grid grid-cols-2 gap-3 p-4 bg-brand-input border border-brand-border rounded-lg max-h-64 overflow-y-auto">
                     {db.teams.map((team: any) => (
                         <div key={team.name} className="col-span-2 mt-2 mb-1">
                             <h4 className="font-bold text-xs uppercase tracking-widest text-[#BCE2C2]">{team.name}</h4>
                             <div className="grid grid-cols-2 gap-2 mt-2">
                               {team.members.map((member: string) => (
                                 <label key={member} className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                    <input type="checkbox" name="assignedTo" value={member} className="w-4 h-4 rounded text-[#BCE2C2]" />
                                    {member}
                                 </label>
                               ))}
                             </div>
                         </div>
                     ))}
                   </div>
                 </div>

                 <button type="submit" className="w-full py-4 bg-[#BCE2C2] hover:bg-[#a6d1ad] text-[#2c5332] font-bold rounded-xl transition shadow-sm">
                   Bulk Assign to Selected
                 </button>
               </form>
            </div>

            {allAssignedTasksTable}
           </div>
        )}

        {/* --- Manage Skills --- */}
        {activeTab === "skills" && (
           <div>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">Manage Training Skills</h1>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
               <div className="bg-brand-card p-8 border border-brand-border rounded-2xl shadow-sm">
                 <h2 className="text-xl font-bold mb-6 text-brand-text">+ Add New Skill</h2>
                 <form action={addSkill} className="space-y-6">
                   <div>
                     <label className="block text-sm font-bold text-brand-muted mb-2">Skill Title</label>
                     <input required name="title" type="text" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="e.g. AI Workflow in 3ds Max" />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-bold text-brand-muted mb-2">Description</label>
                     <textarea name="description" rows={3} className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="Briefly describe the training curriculum..."></textarea>
                   </div>
                   
                   <button type="submit" className="w-full py-4 bg-[#A9CBE2] hover:bg-[#8bb4ce] text-[#1c3f55] font-bold rounded-xl transition shadow-sm">
                     Create Skill
                   </button>
                 </form>
               </div>

               <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm p-0">
                  <div className="p-6 border-b border-brand-border bg-brand-bg">
                    <h2 className="text-xl font-bold text-brand-text">Skills Catalog</h2>
                  </div>
                  <div className="divide-y divide-brand-border">
                     {db.skills && db.skills.map((skill: any) => (
                        <EditableSkillRow 
                           key={skill.id} 
                           skill={skill} 
                           updateAction={updateSkill.bind(null, skill.id)} 
                           deleteAction={deleteSkill.bind(null, skill.id)} 
                        />
                     ))}
                     {(!db.skills || db.skills.length === 0) && (
                        <div className="p-8 text-center text-brand-muted font-bold">
                           No skills registered in the catalog yet.
                        </div>
                     )}
                  </div>
               </div>
            </div>
           </div>
        )}

        {/* --- Assign Skills --- */}
        {activeTab === "assign-skills" && (
           <div>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">Deploy Skills to Team</h1>
              <p className="text-brand-muted mt-2">Assign modules from the Training Catalog directly to member dashboards.</p>
            </header>
            
            <div className="bg-brand-card p-8 border border-brand-border rounded-2xl max-w-2xl shadow-sm">
               <form action={bulkAddTasks} className="space-y-6">
                 <input type="hidden" name="type" value="skill" />
                 
                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Select Skill from Catalog</label>
                   <select required name="title" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium appearance-none">
                     <option value="">-- Choose a Skill --</option>
                     {db.skills?.map((skill: any) => (
                         <option key={skill.id} value={skill.title}>{skill.title}</option>
                     ))}
                   </select>
                   {(!db.skills || db.skills.length === 0) && <p className="text-xs text-amber-600 mt-2 font-bold">Catalog is empty. Please add skills first.</p>}
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Google Drive Resource Link (Optional)</label>
                   <input name="driveLink" type="url" className="w-full bg-brand-input border border-brand-border rounded-lg p-4 font-medium" placeholder="https://drive.google.com/..." />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-brand-muted mb-2">Select Members</label>
                   <div className="grid grid-cols-2 gap-3 p-4 bg-brand-input border border-brand-border rounded-lg max-h-64 overflow-y-auto">
                     {db.teams.map((team: any) => (
                         <div key={team.name} className="col-span-2 mt-2 mb-1">
                             <h4 className="font-bold text-xs uppercase tracking-widest text-[#A9CBE2]">{team.name}</h4>
                             <div className="grid grid-cols-2 gap-2 mt-2">
                               {team.members.map((member: string) => (
                                 <label key={member} className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                    <input type="checkbox" name="assignedTo" value={member} className="w-4 h-4 rounded text-[#A9CBE2]" />
                                    {member}
                                 </label>
                               ))}
                             </div>
                         </div>
                     ))}
                   </div>
                 </div>

                 <button type="submit" className="w-full py-4 bg-[#A9CBE2] hover:bg-[#8bb4ce] text-[#1c3f55] font-bold rounded-xl transition shadow-sm">
                   Bulk Assign Skill to Selected
                 </button>
               </form>
            </div>
           </div>
        )}

        {/* --- Members Roster --- */}
        {activeTab === "members" && (
          <div>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">Team Members Roster</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {db.teams.map((team: any, i: number) => (
                <div key={i} className="bg-brand-card p-6 border border-brand-border rounded-2xl shadow-sm">
                   <h2 className="text-xl font-bold mb-4 px-2">{team.name}</h2>
                   <div className="flex flex-col gap-2">
                     {team.members.map((member: string, j: number) => (
                        <div key={j} className="p-3 bg-brand-bg border border-brand-border rounded-lg font-bold text-brand-text">
                           {member}
                        </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Overview --- */}
        {activeTab === "overview" && (
           <div className="flex flex-col items-center justify-center p-24 text-center">
             <div className="w-24 h-24 bg-brand-input rounded-full mb-6 flex items-center justify-center opacity-50">
                <Logo />
             </div>
             <h2 className="text-2xl font-bold text-brand-muted">This module is under construction</h2>
             <p className="text-brand-muted mt-2">Use the Sidebar to navigate through the new Admin modules.</p>
           </div>
        )}

      </main>
    </div>
  );
}
