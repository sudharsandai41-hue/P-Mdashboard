"use client";

import { useState } from "react";
import DeleteButton from "./DeleteButton";

export default function EditableSkillRow({ 
  skill, 
  updateAction, 
  deleteAction 
}: { 
  skill: any, 
  updateAction: (formData: FormData) => void,
  deleteAction: (formData: FormData) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="p-6 bg-[#A9CBE2]/10 border-b border-brand-border transition">
        <form 
          action={(formData) => {
            updateAction(formData);
            setIsEditing(false);
          }} 
          className="flex flex-col gap-3"
        >
          <input 
            required 
            name="title" 
            type="text" 
            defaultValue={skill.title} 
            className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#A9CBE2] outline-none" 
          />
          <textarea 
            name="description" 
            rows={2} 
            defaultValue={skill.description} 
            className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#A9CBE2] outline-none" 
          />
          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-bold text-brand-muted hover:text-brand-text transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-bold bg-[#A9CBE2] hover:bg-[#8bb4ce] text-[#1c3f55] rounded-lg shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-between items-start hover:bg-brand-bg transition group border-b border-transparent hover:border-brand-border/50">
       <div className="flex-1 pr-4">
          <h3 className="font-bold text-lg">{skill.title}</h3>
          <p className="text-sm text-brand-muted mt-1 break-words">{skill.description}</p>
       </div>
       <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
          <button 
             onClick={() => setIsEditing(true)}
             className="w-8 h-8 flex items-center justify-center bg-brand-input hover:bg-[#e4d5b7] text-brand-text rounded-lg transition"
             title="Edit Skill"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
             </svg>
          </button>
          <DeleteButton action={deleteAction} />
       </div>
    </div>
  );
}
