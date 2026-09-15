"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) setError(error.message);
    else setStage("code");
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pine px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-gold text-xs tracking-widest uppercase mb-2">Family Man Planner</div>
        <h1 className="text-white text-2xl font-bold mb-6" style={{ fontFamily: "Georgia, serif" }}>
          Sign in to your planner
        </h1>

        {stage === "email" && (
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
              disabled={!email || loading}
              className="w-full py-3 rounded-lg bg-rust text-white font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </>
        )}

        {stage === "code" && (
          <>
            <div className="text-white text-sm bg-white/10 rounded-lg p-4 mb-4">
              We sent a 6-digit code to <b>{email}</b>. Enter it below.
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-lg mb-3 outline-none text-sm text-center tracking-widest text-lg"
            />
            <button
              onClick={handleVerify}
              disabled={!code || loading}
              className="w-full py-3 rounded-lg bg-rust text-white font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Checking…" : "Verify & sign in"}
            </button>
          </>
        )}

        {error && <div className="text-red-300 text-xs mt-3">{error}</div>}
      </div>
    </div>
  );
}
