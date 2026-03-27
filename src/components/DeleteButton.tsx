"use client";

export default function DeleteButton({ action }: { action: (formData: FormData) => void }) {
  return (
    <form 
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("Are you sure you want to delete this? This action cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button 
        type="submit" 
        className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  );
}
