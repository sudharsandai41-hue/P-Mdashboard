"use client";

import { useState } from "react";
import DeleteButton from "./DeleteButton";

export default function EditableTaskRow({ 
  task, 
  updateAction, 
  deleteAction,
  membersList 
}: { 
  task: any, 
  updateAction: (formData: FormData) => void,
  deleteAction: (formData: FormData) => void,
  membersList: string[]
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="bg-[#F3C4D6]/10 border-b border-brand-border transition">
         <td colSpan={7} className="p-3">
           <form 
              action={(formData) => {
                 updateAction(formData);
                 setIsEditing(false);
              }} 
              className="flex items-center gap-3 w-full"
           >
             <input 
               required 
               name="title" 
               type="text" 
               defaultValue={task.title} 
               className="flex-1 bg-brand-bg border border-brand-border rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#F3C4D6] outline-none" 
               placeholder="Task Title"
             />
             
             <select 
               name="assignedTo" 
               defaultValue={task.assignedTo}
               className="w-40 bg-brand-bg border border-brand-border rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#F3C4D6] outline-none appearance-none"
             >
               {membersList.map(m => (
                 <option key={m} value={m}>{m}</option>
               ))}
             </select>

             <input 
               name="driveLink" 
               type="url" 
               defaultValue={task.driveLink || ""} 
               placeholder="Drive Link (Optional)"
               className="w-64 bg-brand-bg border border-brand-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#F3C4D6] outline-none" 
             />

             <div className="flex gap-2">
               <button 
                 type="button" 
                 onClick={() => setIsEditing(false)}
                 className="px-3 py-2 text-xs font-bold text-brand-muted hover:text-brand-text transition"
               >
                 Cancel
               </button>
               <button 
                 type="submit" 
                 className="px-3 py-2 text-xs font-bold bg-[#F3C4D6] hover:bg-[#e4aec2] text-[#c24f79] rounded-lg shadow-sm transition"
               >
                 Save
               </button>
             </div>
           </form>
         </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-brand-bg transition group">
       <td className="p-3 font-medium">
         {task.title}
       </td>
       <td className="p-3 font-bold">{task.assignedTo}</td>
       <td className="p-3 text-xs text-brand-muted font-bold uppercase tracking-wider">{task.team}</td>
       <td className="p-3">
          {task.type === 'skill' ? (
             <span className="bg-[#A9CBE2]/20 text-[#5A87A8] px-2 py-1 rounded text-xs border border-[#A9CBE2]/50 font-bold uppercase tracking-wider">Skill</span>
          ) : (
             <span className="bg-[#BCE2C2]/20 text-[#2c5332] px-2 py-1 rounded text-xs border border-[#BCE2C2]/50 font-bold uppercase tracking-wider">Task</span>
          )}
       </td>
       <td className="p-3">
          {task.status === "Scored" ? (
             <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold">Scored ({task.score}%)</span>
          ) : (
             <span className="px-3 py-1 bg-[#F7E7A6]/50 text-amber-800 rounded-lg text-xs font-bold">Review</span>
          )}
       </td>
       <td className="p-3">
          {task.driveLink ? (
             <a href={task.driveLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#c24f79] hover:underline">View Link</a>
          ) : (
             <span className="text-xs text-brand-muted italic">None</span>
          )}
       </td>
       <td className="p-3">
          <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <button 
               onClick={() => setIsEditing(true)}
               className="w-8 h-8 flex items-center justify-center bg-brand-input hover:bg-[#F3C4D6]/50 text-[#c24f79] rounded-lg transition"
               title="Edit Task"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
               </svg>
            </button>
            <DeleteButton action={deleteAction} />
          </div>
       </td>
    </tr>
  );
}
