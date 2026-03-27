import Link from "next/link";
import Logo from "@/components/Logo";
import FloatingChat from "@/components/FloatingChat";
import { getDatabase, submitFeedback } from "@/lib/actions";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberDashboard({ searchParams }: { searchParams: Promise<{ team?: string, user?: string }> }) {
  noStore(); // Completely disable caching for this page
  const db = await getDatabase();
  const resolvedParams = await searchParams;
  
  const teamType = resolvedParams.team || "Design Team";
  const userName = resolvedParams.user || "AJISH";

  // Identify SuperUser (CEO / Admin) overriding view
  const isSuperUser = userName.toLowerCase() === "sidd" || userName.toLowerCase() === "sudharsan";
  
  // Data extraction
  const teamData = db.teams.find((t: any) => t.name === teamType);
  const allTeamMembers: string[] = teamData ? teamData.members : [];

  // Sort team members: Logged in user first, then alphabetical
  const sortedMembers = [...allTeamMembers].sort((a, b) => {
      if (a.toLowerCase() === userName.toLowerCase()) return -1;
      if (b.toLowerCase() === userName.toLowerCase()) return 1;
      return a.localeCompare(b);
  });

  // Task filtering
  const allTeamTasks = db.tasks.filter((t: any) => t.team === teamType);
  const memberTasks = allTeamTasks.filter((t: any) => 
     isSuperUser ? true : t.assignedTo.toLowerCase() === userName.toLowerCase()
  );
  
  // Scoring logic
  const userScoredTasks = memberTasks.filter((t: any) => t.score !== null);
  const teamScoredTasks = allTeamTasks.filter((t: any) => t.score !== null);

  const userAvgScore = userScoredTasks.length > 0 
    ? Math.round(userScoredTasks.reduce((acc: number, curr: any) => acc + curr.score, 0) / userScoredTasks.length)
    : null;

  const teamAvgScore = teamScoredTasks.length > 0
    ? Math.round(teamScoredTasks.reduce((acc: number, curr: any) => acc + curr.score, 0) / teamScoredTasks.length)
    : null;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-8">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
           <Logo />
           <div>
             <h1 className="text-3xl font-bold tracking-tight mb-1 text-brand-text break-all">
                {isSuperUser ? `Welcome, ` : `Welcome, `}
                <span className="text-[#8C7B6E] drop-shadow-sm font-extrabold">{userName.toUpperCase()}</span>
                {isSuperUser && <span className="text-xs ml-2 text-[#5A87A8] bg-[#A9CBE2]/30 px-2 py-1 rounded">(Super View)</span>}
             </h1>
             <p className="text-brand-muted font-medium">{teamType} Dashboard</p>
           </div>
        </div>
        <Link href="/" className="px-6 py-2 bg-brand-text text-brand-bg font-bold rounded-lg hover:bg-black transition whitespace-nowrap shadow-sm">Log Out</Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Tasks Section */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#8C7B6E]">
             {isSuperUser ? `All Pipeline Tasks (${teamType})` : `My Active Pipeline`}
          </h2>
          
          {memberTasks.length === 0 && (
             <div className="p-8 bg-brand-card rounded-2xl border border-brand-border text-center font-bold text-brand-muted shadow-sm">
               No tasks currently assigned to you, {userName}.
             </div>
          )}

          {memberTasks.map((task: any) => (
             <div key={task.id} className="bg-brand-card border border-brand-border shadow-sm rounded-2xl p-8 relative overflow-hidden">
               {/* Accent Glow */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#BCE2C2]/30 rounded-bl-full blur-[60px] pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-brand-text">{task.title}</h3>
                    {isSuperUser && <p className="text-sm font-bold text-[#5A87A8] mt-1">Assigned To: {task.assignedTo}</p>}
                    {task.updatedAt && <p className="text-xs text-brand-muted mt-2">Last updated: {new Date(task.updatedAt).toLocaleDateString()}</p>}
                 </div>
                 {task.status === "Scored" ? (
                    <span className="px-4 py-1.5 bg-green-50 text-green-700 text-xs rounded-full font-bold shadow-sm whitespace-nowrap">Scored</span>
                 ) : (
                    <span className="px-4 py-1.5 bg-[#F7E7A6]/50 text-amber-800 text-xs rounded-full font-bold shadow-sm whitespace-nowrap uppercase tracking-wider">{task.status}</span>
                 )}
               </div>
               
               {/* SCORE DISPLAY LOGIC */}
               {teamType === "3D Team" ? (
                  <div className={`mb-6 p-4 rounded-xl font-bold ${task.status === "Scored" ? 'text-green-700 bg-green-50 border border-green-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                      {task.status === "Scored" ? `✓ Training Module Evaluated Successfully` : `Training in Progress (Submission Pending Admin Review)`}
                  </div>
               ) : (
                  <div className={`mb-6 p-4 rounded-xl font-bold ${task.status === "Scored" ? 'text-green-700 bg-green-50 border border-green-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                      {task.status === "Scored" ? `Admin Scored: ${task.score}%` : `N/A (Awaiting Score)`}
                  </div>
               )}

               <div className="flex gap-4 items-end mt-6">
                 <form className="flex-1 space-y-2 relative z-10" action={async (formData) => {
                    "use server"
                    await submitFeedback(task.id, formData.get("feedback") as string);
                 }}>
                   <label className="text-sm font-bold text-brand-muted">Your Workflow Feedback Highlights</label>
                   <div className="flex gap-2">
                       <input 
                          type="text" 
                          name="feedback"
                          defaultValue={task.feedback || ""}
                          placeholder="e.g. Generated initial concept via Midjourney..."
                          className="w-full bg-brand-input border border-brand-border p-3 rounded-lg font-medium outline-none focus:ring-2 focus:ring-[#C8B6E2]"
                       />
                       <button className="px-5 py-3 bg-[#A9CBE2] hover:bg-[#8eb8d4] text-[#1c3f55] font-bold rounded-lg transition white-space-nowrap shadow-sm">
                         Update
                       </button>
                   </div>
                 </form>
               </div>

               {task.driveLink && (
                  <div className="mt-6 pt-6 border-t border-brand-border relative z-10">
                     <a href={task.driveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#C8B6E2] font-extrabold hover:text-[#a58dc7] transition">
                        🔗 Open Google Drive Reference
                     </a>
                  </div>
               )}
             </div>
          ))}
        </section>

        {/* Right Section: Scorecard & Team */}
        <div className="space-y-8">
          
          {/* Performance Scorecard */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#8C7B6E]">Performance Rating</h2>
            
            <div className="bg-brand-card shadow-sm border border-brand-border rounded-2xl p-8 flex flex-col items-center">
              
              <div className="w-48 h-48 rounded-full border-[12px] border-brand-bg border-t-[#C8B6E2] flex flex-col items-center justify-center mb-8 relative shadow-inner">
                {teamType === "3D Team" ? (
                   <>
                     <span className="text-4xl font-bold text-brand-text">{isSuperUser ? 'TEAM' : '3D'}<span className="text-xl text-brand-muted"></span></span>
                     <span className="text-xs text-brand-muted mt-2 uppercase tracking-widest font-bold text-center">Module<br/>Tracking</span>
                   </>
                ) : (
                   <>
                     <span className="text-5xl font-extrabold text-[#8C7B6E]">{userAvgScore !== null ? userAvgScore : 'N/A'}<span className="text-2xl text-brand-muted">%</span></span>
                     <span className="text-[10px] text-brand-muted mt-2 uppercase tracking-widest font-bold">{isSuperUser ? 'TEAM AVG' : 'YOUR OVERALL AI'}</span>
                   </>
                )}
              </div>
              
              <div className="w-full space-y-4 pt-4 border-t border-brand-border">
                {teamType === "3D Team" ? (
                   <>
                     <div className="flex justify-between text-sm items-center">
                        <span className="text-brand-muted font-bold">Training Done</span>
                        <span className="font-bold text-[#5A87A8] bg-[#A9CBE2]/20 px-3 py-1 rounded-lg">{isSuperUser ? teamScoredTasks.length : userScoredTasks.length}</span>
                     </div>
                   </>
                ) : (
                   <>
                     <div className="flex justify-between text-sm items-center">
                        <span className="text-brand-muted font-bold">Your Score</span>
                        <span className="font-bold text-[#8C7B6E] text-lg">{userAvgScore !== null ? `${userAvgScore}%` : 'N/A'}</span>
                     </div>
                     <div className="flex justify-between text-sm items-center">
                        <span className="text-brand-muted font-bold">Team Average</span>
                        <span className="font-bold text-[#5A87A8] text-lg">{teamAvgScore !== null ? `${teamAvgScore}%` : 'N/A'}</span>
                     </div>
                   </>
                )}
                <div className="flex justify-between text-sm items-center pt-2">
                   <span className="text-brand-muted font-bold">Tasks Assigned</span>
                   <span className="font-extrabold text-brand-text">{memberTasks.length}</span>
                </div>
              </div>

            </div>
          </section>

          {/* New Personalization: Team Overview Stringent Block */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-[#8C7B6E]">{teamType} Overview</h2>
             
             <div className="bg-brand-card shadow-sm border border-brand-border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-border px-2">
                   <span className="text-sm font-bold tracking-widest uppercase text-brand-muted">Member</span>
                   <span className="text-sm font-bold tracking-widest uppercase text-brand-muted">Status</span>
                </div>

                <ul className="space-y-3">
                   {sortedMembers.map((member) => {
                       const isMe = member.toLowerCase() === userName.toLowerCase();
                       
                       return (
                          <li 
                            key={member} 
                            className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                               isMe 
                               ? 'bg-[#E6D4AA]/40 border-[1.5px] border-[#d4b97d] shadow-sm transform scale-[1.02]' 
                               : 'hover:bg-brand-bg border border-transparent hover:border-brand-border'
                            }`}
                          >
                             <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isMe ? 'bg-[#c5a65c] text-white' : 'bg-brand-input text-brand-muted'}`}>
                                 {member.substring(0,2).toUpperCase()}
                               </div>
                               <span className={`font-bold ${isMe ? 'text-[#a18134] text-lg' : 'text-brand-text/80'}`}>
                                 {member}
                               </span>
                               {isMe && !isSuperUser && (
                                  <span className="px-2 py-0.5 bg-[#c5a65c] text-white text-[10px] font-extrabold rounded-md ml-1 uppercase shadow-sm tracking-wider">You</span>
                                )}
                             </div>
                             
                             {/* Optional micro-graphic showing activity */}
                             <div className="flex gap-1">
                               <div className={`w-1.5 h-1.5 rounded-full ${isMe ? 'bg-[#c5a65c]' : 'bg-green-400 opacity-50'}`}></div>
                             </div>
                          </li>
                       )
                   })}
                   
                   {sortedMembers.length === 0 && (
                      <div className="p-4 text-center text-sm font-bold text-brand-muted">
                         No members found for this team.
                      </div>
                   )}
                 </ul>
              </div>
           </section>

           {/* FLOATING CHAT WIDGET */}
           <FloatingChat teamType={teamType} userName={userName} />

        </div>
      </div>
    </div>
  );
}
