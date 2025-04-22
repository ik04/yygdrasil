"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/icons/google";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#3ECF8E]">Log In</h1>
          <p className="text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link href="/signup" className="underline text-[#3ECF8E]">
              Sign up
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </div>

        <Separator className="my-6 bg-gray-700" />

        <Button
          variant="outline"
          className="w-full text-black"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </Button>

        <Button
          variant="ghost"
          className="w-full text-sm text-gray-400"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
      </div>
    </div>
  );
}
