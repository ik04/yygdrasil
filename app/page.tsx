"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Particles from "@/components/Particles/Particles";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative">
      <div className="absolute inset-0 z-0">
        <Particles
          className="w-full h-full"
          particleColors={["#3ECF8E", "#3ECF8E"]}
          particleCount={200}
          particleSpread={10}
          speed={0.6}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-800 relative z-20">
        <Link href="/" className="text-2xl text-[#3ECF8E] font-agu">
          Yygdrasil
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-gray-400">{user.email?.split("@")[0]}</span>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-[#3ECF8E] hover:text-[#34b87a]"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="default"
                onClick={handleLogout}
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-white text-black hover:bg-white font-body"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#3ECF8E] text-black hover:bg-[#34b87a] font-body">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-6 py-10 text-center relative z-20">
        <div className="max-w-2xl space-y-8 backdrop-blur-sm bg-black/30 p-8 rounded-lg">
          <h1 className="text-4xl sm:text-7xl tracking-tight text-[#3ECF8E] font-agu">
            Yygdrasil
          </h1>
          <p className="text-lg sm:text-2xl text-white font-kalam">
            A Tree of ideas that doesn't stop growing
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button className="px-6 py-3 font-body text-lg bg-[#3ECF8E] text-black hover:bg-[#34b87a]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
