"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export default function AdminInboxFilters({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      
      // Reset page to 1 on filter change
      if (name !== 'page') {
         params.set('page', '1');
      }
      
      return params.toString();
    },
    [searchParams]
  );

  const setFilter = (key: string, value: string) => {
     router.push(pathname + '?' + createQueryString(key, value));
  };

  const currentSearch = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(currentSearch);

  return (
    <div className="bg-brand-card p-4 rounded-xl border border-brand-border shadow-sm mb-6 mt-4 flex flex-col gap-4">
       <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex-1 min-w-[200px]">
             <form onSubmit={(e) => { e.preventDefault(); setFilter('search', localSearch); }}>
               <input 
                 type="text" 
                 placeholder="Search by Title or Member..."
                 value={localSearch}
                 onChange={(e) => setLocalSearch(e.target.value)}
                 className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#BCE2C2] outline-none"
               />
             </form>
          </div>

          <select 
             value={searchParams.get('team') || ''} 
             onChange={(e) => setFilter('team', e.target.value)}
             className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm font-bold text-brand-muted appearance-none cursor-pointer focus:ring-2 focus:ring-[#BCE2C2] outline-none"
          >
             <option value="">All Teams</option>
             <option value="Design Team">Design Team</option>
             <option value="3D Team">3D Team</option>
          </select>

          <select 
             value={searchParams.get('status') || ''} 
             onChange={(e) => setFilter('status', e.target.value)}
             className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm font-bold text-brand-muted appearance-none cursor-pointer focus:ring-2 focus:ring-[#BCE2C2] outline-none"
          >
             <option value="">All Statuses</option>
             <option value="Review">Review</option>
             <option value="Scored">Scored</option>
          </select>

          <select 
             value={searchParams.get('type') || ''} 
             onChange={(e) => setFilter('type', e.target.value)}
             className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm font-bold text-brand-muted appearance-none cursor-pointer focus:ring-2 focus:ring-[#BCE2C2] outline-none"
          >
             <option value="">All Types</option>
             <option value="task">Tasks</option>
             <option value="skill">Skills</option>
          </select>

          <select 
             value={searchParams.get('sort') || 'latest'} 
             onChange={(e) => setFilter('sort', e.target.value)}
             className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm font-bold text-brand-text appearance-none cursor-pointer bg-[#BCE2C2]/10 focus:ring-2 focus:ring-[#BCE2C2] outline-none"
          >
             <option value="latest">Latest First</option>
             <option value="oldest">Oldest First</option>
             <option value="score_high">Highest Score</option>
             <option value="score_low">Lowest Score</option>
          </select>
       </div>

       {/* Pagination */}
       <div className="flex justify-between items-center border-t border-brand-border pt-4 mt-2">
          <div className="text-sm font-bold text-brand-muted">
             Page <span className="text-brand-text">{currentPage}</span> of <span className="text-brand-text">{Math.max(1, totalPages)}</span>
          </div>
          <div className="flex gap-2">
             <button 
                disabled={currentPage <= 1}
                onClick={() => setFilter('page', (currentPage - 1).toString())}
                className="px-4 py-1.5 text-sm font-bold border border-brand-border rounded-lg hover:bg-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
             >
                Previous
             </button>
             <button 
                disabled={currentPage >= totalPages}
                onClick={() => setFilter('page', (currentPage + 1).toString())}
                className="px-4 py-1.5 text-sm font-bold border border-brand-border rounded-lg hover:bg-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
             >
                Next
             </button>
          </div>
       </div>

    </div>
  );
}
