"use client";

import { useState } from "react";

export default function EditableMemberRow({ 
  memberName, 
  updateAction 
}: { 
  memberName: string, 
  updateAction: (formData: FormData) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="p-3 bg-brand-bg border border-brand-border rounded-lg transition">
        <form 
          action={(formData) => {
            updateAction(formData);
            setIsEditing(false);
          }} 
          className="flex items-center gap-2"
        >
          <input 
            required 
            name="newName" 
            type="text" 
            defaultValue={memberName} 
            className="flex-1 bg-brand-input border border-brand-border rounded px-2 py-1 font-bold focus:ring-2 focus:ring-[#C8B6E2] outline-none" 
          />
          <button 
            type="button" 
            onClick={() => setIsEditing(false)}
            className="px-2 py-1 text-xs font-bold text-brand-muted hover:text-brand-text transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-2 py-1 text-xs font-bold bg-[#C8B6E2] hover:bg-[#b09bc9] text-white rounded shadow-sm transition"
          >
            Save
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-3 bg-brand-bg border border-brand-border hover:border-[#C8B6E2]/50 rounded-lg flex justify-between items-center transition group">
       <span className="font-bold text-brand-text break-words line-clamp-1">{memberName}</span>
       <button 
          onClick={() => setIsEditing(true)}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-brand-input hover:bg-[#C8B6E2]/30 text-[#8b6cb0] rounded opacity-0 group-hover:opacity-100 transition"
          title="Edit Name"
       >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
       </button>
    </div>
  );
}
