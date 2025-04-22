"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
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
          <h1 className="text-3xl font-bold text-[#3ECF8E]">Sign Up</h1>
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="underline text-[#3ECF8E]">
              Log in
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
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleSignup} disabled={loading} className="w-full">
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </div>

        <Separator className="my-6 bg-gray-700" />

        <Button
          variant="outline"
          className="w-full text-black"
          onClick={handleGoogleLogin}
        >
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
