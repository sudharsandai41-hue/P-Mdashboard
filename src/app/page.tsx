"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { validateLogin } from "@/lib/actions";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState("Design Team");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");
    if (password !== "1234") {
      setError("Invalid password");
      return;
    }

    const isValidUser = await validateLogin(role, userId);
    if (!isValidUser) {
      setError(`Invalid ID for ${role}`);
      return;
    }

    if (role === "Admin") {
      router.push("/admin");
    } else if (role === "CEO") {
      router.push("/main-dashboard");
    } else if (role === "3D Team") {
      router.push(`/member-dashboard?team=3D Team&user=${userId}`);
    } else {
      router.push(`/member-dashboard?team=Design Team&user=${userId}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-bg p-6 text-brand-text relative">
      <div className="z-10 w-full max-w-md flex justify-end absolute top-8 right-8">
         <div className="scale-75 origin-top-right opacity-80">
            <Logo />
         </div>
      </div>

      <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm">
        <div className="mb-12 flex justify-center scale-125">
           <Logo />
        </div>
        
        <div className="bg-brand-card border border-brand-border p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl mb-4 font-bold text-center text-brand-text">Studio Login</h2>
          
          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-center font-bold text-xs">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-semibold text-brand-muted">Role / Team</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-brand-input border-brand-border border rounded-lg p-4 text-brand-text mb-2 focus:ring-2 focus:ring-[#C8B6E2]"
              >
                <option value="Design Team">Design Team</option>
                <option value="3D Team">3D Team</option>
                <option value="Admin">Admin</option>
                <option value="CEO">CEO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 font-semibold text-brand-muted">User ID</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-brand-input border-brand-border border rounded-lg p-4 text-brand-text focus:ring-2 focus:ring-[#C8B6E2]" 
                placeholder="Enter ID" 
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-semibold text-brand-muted">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-input border-brand-border border rounded-lg p-4 text-brand-text focus:ring-2 focus:ring-[#C8B6E2]" 
                placeholder="Hint: 1234" 
              />
            </div>
            <button 
              onClick={handleSignIn}
              className="w-full bg-brand-text text-brand-card hover:bg-black font-bold p-4 rounded-xl transition-colors mt-6 text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full flex h-3">
        <div className="bg-[#E6D4AA] flex-1"></div>
        <div className="bg-[#C8B6E2] flex-1"></div>
        <div className="bg-[#F3C4D6] flex-1"></div>
        <div className="bg-[#BCE2C2] flex-1"></div>
        <div className="bg-[#F7E7A6] flex-1"></div>
      </div>
    </main>
  );
}
