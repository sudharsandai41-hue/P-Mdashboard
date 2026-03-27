import Link from "next/link";
import WorkflowDiagram from "@/components/WorkflowDiagram";
import Logo from "@/components/Logo";
import { getDatabase } from "@/lib/actions";
import { unstable_noStore as noStore } from 'next/cache';
import { Award, AlertTriangle, Hourglass } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MainDashboard(props: { searchParams: Promise<{ filter?: string }> }) {
  noStore();
  const searchParams = await props.searchParams;
  const filter = searchParams.filter;
  
  const db = await getDatabase();
  const allTasks = db.tasks;
  
  // Basic Metrics
  const activeTasks = allTasks.filter((t: any) => t.score === null);
  const completedTasks = allTasks.filter((t: any) => t.score !== null);
  
  const calcAvg = (tasksList: any[]) => {
      const scored = tasksList.filter((t) => t.score !== null);
      if (scored.length === 0) return null;
      const total = scored.reduce((acc, curr) => acc + curr.score, 0);
      return Math.round(total / scored.length);
  };

  const designTasks = allTasks.filter((t: any) => t.team === "Design Team");
  const d3Tasks = allTasks.filter((t: any) => t.team === "3D Team");
  
  const designAvg = calcAvg(designTasks);
  const d3Avg = calcAvg(d3Tasks);
  const overallAvg = calcAvg(allTasks);

  const designMembers = db.teams.find((t: any) => t.name === "Design Team")?.members || [];
  const d3Members = db.teams.find((t: any) => t.name === "3D Team")?.members || [];
  const allMembers = [...designMembers, ...d3Members];

  // Individual Leaderboard Logic
  const getTopPerformer = (membersList: string[], tasksList: any[]) => {
      let topUser = "N/A";
      let topScore = -1;
      for (const member of membersList) {
          const mTasks = tasksList.filter((t: any) => t.assignedTo.toLowerCase() === member.toLowerCase());
          const avg = calcAvg(mTasks);
          if (avg !== null && avg > topScore) {
              topScore = avg;
              topUser = member;
          }
      }
      return { topUser, topScore };
  };

  const designTop = getTopPerformer(designMembers, designTasks);
  const d3Top = getTopPerformer(d3Members, d3Tasks);

  // Apply visual filtering logic
  const showDesign = filter === 'design' || !filter;
  const show3D = filter === '3d' || !filter;

  const activeFilterMembers = filter === 'design' ? designMembers : filter === '3d' ? d3Members : allMembers;
  const activeFilterTasks = filter === 'design' ? designTasks : filter === '3d' ? d3Tasks : allTasks;

  const individualStats = activeFilterMembers.map((member: any) => {
      const mTasks = activeFilterTasks.filter((t: any) => t.assignedTo.toLowerCase() === member.toLowerCase());
      const avg = calcAvg(mTasks);
      const team = designMembers.includes(member) ? "Design" : "3D";
      return { name: member, team, tasksCount: mTasks.length, avgScore: avg };
  }).sort((a: any, b: any) => {
      if (a.avgScore === null) return 1;
      if (b.avgScore === null) return -1;
      return b.avgScore - a.avgScore;
  });

  // Smart Insights Alerts
  const topPerformers = individualStats.filter((u: any) => u.avgScore !== null && u.avgScore >= 90).map((u: any) => u.name);
  const lowPerformers = individualStats.filter((u: any) => u.avgScore !== null && u.avgScore < 60).map((u: any) => u.name);
  const pendingReviewsCount = activeTasks.filter((t: any) => t.status === "Review").length;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-8 pb-32">
      <header className="flex justify-between items-center mb-10">
        <Link href="/main-dashboard" className="flex items-center gap-6 cursor-pointer group">
          <Logo />
          <div className="group-hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1c1917]">P&M AI TRAINING SESSION</h1>
            <p className="font-bold text-[#8C7B6E]">Sidd Dashboard View</p>
          </div>
        </Link>
        <Link href="/" className="px-6 py-2 bg-[#1c1917] hover:bg-black text-white font-bold rounded-lg shadow-sm transition">Logout</Link>
      </header>

      <div className="space-y-8">
        
        {/* TOP OVERVIEW RIBBON */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-brand-card shadow-sm border border-brand-border p-4 rounded-2xl flex flex-col justify-between">
             <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Active Tasks</span>
             <span className="text-3xl font-extrabold text-[#1c1917] mt-2">{activeTasks.length}</span>
          </div>
          <div className="bg-brand-card shadow-sm border border-brand-border p-4 rounded-2xl flex flex-col justify-between">
             <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Completed Level</span>
             <span className="text-3xl font-extrabold text-[#5A87A8] mt-2">{completedTasks.length}</span>
          </div>
          <div className="bg-brand-card shadow-sm border border-brand-border p-4 rounded-2xl flex flex-col justify-between">
             <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Design Avg</span>
             <span className="text-3xl font-extrabold text-[#8C7B6E] mt-2">{designAvg !== null ? `${designAvg}%` : '-'}</span>
          </div>
          <div className="bg-brand-card shadow-sm border border-brand-border p-4 rounded-2xl flex flex-col justify-between">
             <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">3D Team Standing</span>
             <span className="text-xl leading-tight font-bold text-[#a18134] mt-2">
                 {d3Avg !== null ? `${d3Avg}% Avg` : "Training Not Started"}
             </span>
          </div>
          <div className="bg-[#1c1917] shadow-sm border border-[#302e2c] p-4 rounded-2xl flex flex-col justify-between">
             <span className="text-xs font-bold text-[#a8a19c] uppercase tracking-wider">Overall Co. Score</span>
             <span className="text-4xl font-extrabold text-white mt-2">{overallAvg !== null ? `${overallAvg}%` : 'N/A'}</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SMART INSIGHTS ALERT */}
          <section className="lg:col-span-1 space-y-6 flex flex-col h-full bg-[#fcf9f6] border border-brand-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3C4D6]/30 rounded-full blur-[40px]"></div>
             <h2 className="text-lg font-bold text-[#1c1917] uppercase tracking-widest border-b border-brand-border pb-2">Smart Insights</h2>
             <div className="flex-1 space-y-4 pt-2">
                <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-brand-border/50">
                   <h3 className="text-sm font-bold text-green-700 tracking-wide flex items-center gap-2">
                     <Award className="w-4 h-4 text-[#1c1917]" /> Top Performers {`>90%`}
                   </h3>
                   {topPerformers.length > 0 ? (
                      <p className="text-[#1c1917] font-semibold mt-2">{topPerformers.join(', ')}</p>
                   ) : (
                      <p className="text-brand-muted font-medium text-sm mt-2">No users above 90% yet.</p>
                   )}
                </div>

                <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-brand-border/50">
                   <h3 className="text-sm font-bold text-red-700 tracking-wide flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4 text-[#1c1917]" /> Action Required {`<60%`}
                   </h3>
                   {lowPerformers.length > 0 ? (
                      <p className="text-red-900 font-bold mt-2">{lowPerformers.join(', ')}</p>
                   ) : (
                      <p className="text-brand-muted font-medium text-sm mt-2">All scored units are healthy.</p>
                   )}
                </div>

                <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-brand-border/50 mt-auto">
                   <h3 className="text-sm font-bold text-amber-700 tracking-wide flex items-center gap-2">
                     <Hourglass className="w-4 h-4 text-[#1c1917]" /> Inbox Backlog
                   </h3>
                   <div className="flex items-center gap-3 mt-2">
                      <span className="text-3xl font-extrabold text-amber-600">{pendingReviewsCount}</span>
                      <span className="text-brand-muted font-medium text-sm leading-tight">Tasks pending<br/>Admin score</span>
                   </div>
                </div>
             </div>
          </section>

          {/* TEAM PERFORMANCE OVERVIEWS */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            
            {showDesign && (
            <section className="bg-brand-card shadow-sm border border-brand-border p-8 rounded-3xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C8B6E2]/20 rounded-bl-full blur-[50px] pointer-events-none"></div>
              <h2 className="text-2xl font-bold mb-6 text-[#1c1917]">Design Team</h2>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50">
                  <p className="text-xs font-bold text-brand-muted uppercase">Avg Score</p>
                  <p className="text-2xl font-extrabold text-[#8C7B6E] mt-1">{designAvg !== null ? `${designAvg}%` : '-'}</p>
                </div>
                <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50">
                  <p className="text-xs font-bold text-brand-muted uppercase">Members</p>
                  <p className="text-2xl font-extrabold text-[#1c1917] mt-1">{designMembers.length}</p>
                </div>
                <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50">
                  <p className="text-xs font-bold text-brand-muted uppercase">Done (Scored)</p>
                  <p className="text-2xl font-extrabold text-[#5A87A8] mt-1">{completedTasks.filter((t: any)=>t.team==="Design Team").length}</p>
                </div>
                <div className="bg-brand-bg/50 p-4 rounded-xl border border-[#C8B6E2]/50 shadow-sm">
                  <p className="text-xs font-bold text-[#8a6bba] uppercase">Submitted (Unscored)</p>
                  <p className="text-lg font-bold text-[#1c1917] mt-1 truncate">{designTasks.filter((t: any)=>t.status==="Review").length} Tasks</p>
                </div>
              </div>
            </section>
            )}

            {show3D && (
            <section className="bg-brand-card shadow-sm border border-brand-border p-8 rounded-3xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#E6D4AA]/30 rounded-bl-full blur-[50px] pointer-events-none"></div>
              <h2 className="text-2xl font-bold mb-6 text-[#1c1917]">3D Team</h2>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                {d3Avg !== null ? (
                   <>
                     <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50">
                       <p className="text-xs font-bold text-brand-muted uppercase">Avg Score</p>
                       <p className="text-2xl font-extrabold text-[#8C7B6E] mt-1">{d3Avg}%</p>
                     </div>
                     <div className="bg-brand-bg/50 p-4 rounded-xl border border-[#c5a65c]/50 shadow-sm">
                       <p className="text-xs font-bold text-[#a18134] uppercase">Top Lead</p>
                       <p className="text-lg font-bold text-[#1c1917] mt-1 truncate">{d3Top.topUser}</p>
                     </div>
                   </>
                ) : (
                   <div className="col-span-2 bg-[#F7E7A6]/20 p-6 rounded-xl border border-[#E6D4AA] flex flex-col items-center justify-center">
                       <p className="text-xl font-bold text-[#a18134] text-center mb-1">Training Not Started</p>
                       <p className="text-sm font-bold text-[#c5a65c]">{d3Tasks.filter((t: any)=>t.status==="Review").length} Submissions Pending</p>
                   </div>
                )}
                
                <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50 mt-auto">
                  <p className="text-xs font-bold text-brand-muted uppercase">Members</p>
                  <p className="text-2xl font-extrabold text-[#1c1917] mt-1">{d3Members.length}</p>
                </div>
                <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50 mt-auto">
                  <p className="text-xs font-bold text-brand-muted uppercase">Done</p>
                  <p className="text-2xl font-extrabold text-[#5A87A8] mt-1">{completedTasks.filter((t: any)=>t.team==="3D Team").length}</p>
                </div>
              </div>
            </section>
            )}

          </div>
        </div>

        {/* DATA TABLES SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* INDIVIDUAL PERFORMANCE TABLE */}
            <section className="bg-brand-card shadow-sm border border-brand-border rounded-3xl overflow-hidden flex flex-col h-[500px]">
               <div className="p-6 bg-[#fcf9f6] border-b border-brand-border">
                  <h2 className="text-lg font-bold text-[#1c1917] uppercase tracking-widest">Individual Performance</h2>
               </div>
               <div className="overflow-y-auto flex-1 p-2">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-xs font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border/50">
                          <th className="p-4 pl-6">Name</th>
                          <th className="p-4">Team</th>
                          <th className="p-4 text-center">Tasks</th>
                          <th className="p-4 text-center">Avg Score</th>
                          <th className="p-4 pr-6">Status</th>
                       </tr>
                    </thead>
                    <tbody>
                       {individualStats.map((u: any, i: any) => {
                          let rowClass = "border-b border-brand-border/30 transition-colors hover:bg-brand-bg/50";
                          let badge = <span className="text-brand-muted font-bold text-xs">-</span>;
                          if (u.avgScore !== null && u.avgScore >= 90) {
                             rowClass = "bg-[#BCE2C2]/10 border-b border-brand-border/30 hover:bg-[#BCE2C2]/20";
                             badge = <span className="px-2 py-1 bg-[#BCE2C2] text-green-900 text-[10px] uppercase font-bold rounded shadow-sm">Top</span>;
                          } else if (u.avgScore !== null && u.avgScore < 60) {
                             rowClass = "bg-red-50/50 border-b border-red-100 hover:bg-red-50";
                             badge = <span className="px-2 py-1 bg-red-200 text-red-900 text-[10px] uppercase font-bold rounded shadow-sm">Low</span>;
                          }

                          return (
                             <tr key={i} className={rowClass}>
                                <td className="p-4 pl-6 font-bold text-[#1c1917]">{u.name}</td>
                                <td className="p-4 text-sm font-semibold text-brand-muted">{u.team}</td>
                                <td className="p-4 text-center font-bold text-[#5A87A8]">{u.tasksCount}</td>
                                <td className="p-4 text-center font-bold text-[#8C7B6E] text-lg">{u.avgScore !== null ? `${u.avgScore}%` : '-'}</td>
                                <td className="p-4 pr-6">{badge}</td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
               </div>
            </section>

            {/* TASK INSIGHT TABLE */}
            <section className="bg-brand-card shadow-sm border border-brand-border rounded-3xl overflow-hidden flex flex-col h-[500px]">
               <div className="p-6 bg-[#fcf9f6] border-b border-brand-border">
                  <h2 className="text-lg font-bold text-[#1c1917] uppercase tracking-widest">Global Task Feed</h2>
               </div>
               <div className="overflow-y-auto flex-1 p-2">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-xs font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border/50">
                          <th className="p-4 pl-6">Task Name</th>
                          <th className="p-4">Owner</th>
                          <th className="p-4 text-center">Score</th>
                          <th className="p-4 pr-6">Status</th>
                       </tr>
                    </thead>
                    <tbody>
                       {activeFilterTasks.map((t: any, i) => (
                             <tr key={i} className="border-b border-brand-border/30 transition-colors hover:bg-brand-bg/50">
                                <td className="p-4 pl-6 font-bold text-[#1c1917] text-sm max-w-[200px] truncate" title={t.title}>{t.title}</td>
                                <td className="p-4 text-sm font-semibold text-brand-muted">{t.assignedTo}</td>
                                <td className="p-4 text-center font-bold text-[#8C7B6E]">{t.score !== null ? `${t.score}%` : '-'}</td>
                                <td className="p-4 pr-6">
                                   {t.status === "Scored" ? (
                                      <span className="px-3 py-1 bg-green-50/80 text-green-700 text-[10px] uppercase font-bold rounded-md border border-green-100">Scored</span>
                                   ) : t.status === "Review" ? (
                                      <span className="px-3 py-1 bg-amber-50/80 text-amber-700 text-[10px] uppercase font-bold rounded-md border border-amber-100">Review</span>
                                   ) : (
                                      <span className="px-3 py-1 bg-[#EBE0D5] text-brand-muted text-[10px] uppercase font-bold rounded-md">Pending</span>
                                   )}
                                </td>
                             </tr>
                       ))}
                       {activeFilterTasks.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-brand-muted font-bold">No tasks found.</td></tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </section>

        </div>

        {/* WORKFLOW PIPELINE FOOTER */}
        <section className="mt-8 w-full pt-8 relative">
          <h2 className="text-lg font-bold mb-6 text-center text-brand-muted tracking-widest uppercase">System Operations Pipeline</h2>
          <div className="p-12 border border-brand-border rounded-3xl bg-brand-card shadow-sm relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                   <div className="w-1/3 h-64 bg-[#C8B6E2] rounded-full blur-[120px]"></div>
                   <div className="w-1/3 h-64 bg-[#E6D4AA] rounded-full blur-[120px]"></div>
               </div>
              <WorkflowDiagram />
          </div>
        </section>

      </div>
    </div>
  );
}
