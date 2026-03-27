import Link from "next/link";
import Logo from "@/components/Logo";
import { getDatabase, updateScore, addTask } from "@/lib/actions";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const db = await getDatabase();
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "inbox";

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-border p-6 flex flex-col gap-6 bg-brand-card shadow-sm hidden md:flex min-h-screen">
        <div className="scale-75 origin-top-left mb-4">
           <Logo />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-brand-muted text-sm">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/admin?tab=overview" className={`px-4 py-3 rounded-lg font-bold transition ${activeTab === 'overview' ? 'bg-[#E6D4AA]/30 text-brand-text border border-[#E6D4AA]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>Overview</Link>
          <Link href="/admin?tab=members" className={`px-4 py-3 rounded-lg font-bold transition ${activeTab === 'members' ? 'bg-[#C8B6E2]/30 text-brand-text border border-[#C8B6E2]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>Team Members</Link>
          <Link href="/admin?tab=tasks" className={`px-4 py-3 rounded-lg font-bold transition ${activeTab === 'tasks' ? 'bg-[#F3C4D6]/30 text-brand-text border border-[#F3C4D6]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>Assign Tasks</Link>
          <Link href="/admin?tab=inbox" className={`px-4 py-3 rounded-lg font-bold transition ${activeTab === 'inbox' ? 'bg-[#BCE2C2]/30 text-brand-text border border-[#BCE2C2]' : 'hover:bg-brand-bg text-brand-muted border border-transparent'}`}>AI Scoring Inbox</Link>
        </nav>
        <div className="mt-auto">
          <Link href="/" className="px-4 py-3 hover:bg-red-50 hover:text-red-600 rounded-lg w-full text-left transition block text-brand-muted font-bold">Logout</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        
        {activeTab === "inbox" && (
          <div>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">AI Evaluation Inbox</h1>
              <button className="bg-brand-text text-brand-bg px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg">
                Trigger Bulk Score
              </button>
            </header>

            <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-brand-bg text-brand-muted text-sm border-b border-brand-border">
                  <tr>
                    <th className="p-5 font-bold uppercase tracking-wider">Team Member</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Submission Task</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Status</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Modify AI Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-sm">
                  {db.tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-brand-bg transition">
                      <td className="p-5 font-bold">{task.assignedTo} <span className="font-normal text-brand-muted ml-2 text-xs">({task.team})</span></td>
                      <td className="p-5 font-medium">{task.title}</td>
                      <td className="p-5">
                        {task.status === "Scored" ? (
                          <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold">Scored</span>
                        ) : (
                          <span className="px-3 py-1.5 bg-[#F7E7A6]/50 text-amber-800 rounded-lg text-xs font-bold">Review</span>
                        )}
                      </td>
                      <td className="p-5">
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
                            className="w-20 p-2 border border-brand-border rounded-lg bg-brand-input font-bold"
                          />
                          <button type="submit" className="px-3 py-2 bg-[#C8B6E2] hover:bg-[#b09bc9] text-white font-bold rounded-lg transition shadow-sm">
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
           <div>
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-text">Assign New Task</h1>
            </header>
            
            <div className="bg-brand-card p-8 border border-brand-border rounded-2xl max-w-2xl shadow-sm">
               <form action={addTask} className="space-y-6">
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
                       {db.teams.flatMap((t: any) => t.members).map((member: string) => (
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
           </div>
        )}

        {/* Members and Overview views untouched (from previous steps) */}
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

        {activeTab === "overview" && (
           <div className="flex flex-col items-center justify-center p-24 text-center">
             <div className="w-24 h-24 bg-brand-input rounded-full mb-6 flex items-center justify-center opacity-50">
                <Logo />
             </div>
             <h2 className="text-2xl font-bold text-brand-muted">This module is under construction</h2>
             <p className="text-brand-muted mt-2">Use the AI Scoring Inbox to evaluate submissions.</p>
           </div>
        )}

      </main>
    </div>
  );
}
