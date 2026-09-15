"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pine px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-gold text-xs tracking-widest uppercase mb-2">Family Man Planner</div>
        <h1 className="text-white text-2xl font-bold mb-6" style={{ fontFamily: "Georgia, serif" }}>
          Sign in to your planner
        </h1>

        {sent ? (
          <div className="text-white text-sm bg-white/10 rounded-lg p-4">
            Check <b>{email}</b> for a sign-in link.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg mb-3 outline-none text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!email}
              className="w-full py-3 rounded-lg bg-rust text-white font-semibold text-sm disabled:opacity-50"
            >
              Send sign-in link
            </button>
            {error && <div className="text-red-300 text-xs mt-3">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
