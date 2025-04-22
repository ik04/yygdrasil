"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Particles from "@/components/Particles/Particles";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      {/* Particles background */}
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

      {/* Updated Navigation */}
      <nav className="w-full px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row relative z-20 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-xl md:text-2xl text-[#3ECF8E] font-agu"
          >
            Yygdrasil
          </Link>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:items-center md:ml-auto mt-4 md:mt-0 gap-4`}
        >
          {user ? (
            <>
              <span className="text-sm md:text-base text-gray-400">
                {user.email?.split("@")[0]}
              </span>
              <Link href="/dashboard" className="w-full md:w-auto">
                <Button
                  variant="ghost"
                  className="w-full text-[#3ECF8E] hover:text-[#34b87a] text-sm md:text-base"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="default"
                onClick={handleLogout}
                className="w-full md:w-auto border-red-500 text-red-500 hover:bg-red-500/10 text-sm md:text-base"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="w-full md:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-black font-body text-sm md:text-base"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full md:w-auto">
                <Button className="w-full bg-[#3ECF8E] text-black hover:bg-[#34b87a] font-body text-sm md:text-base">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center px-4 md:px-6 py-6 md:py-10 text-center relative z-20">
        <div className="w-full max-w-2xl space-y-6 md:space-y-8 backdrop-blur-sm bg-black/30 p-6 md:p-8 rounded-lg">
          <h1 className="text-3xl md:text-4xl lg:text-7xl tracking-tight text-[#3ECF8E] font-agu">
            Yygdrasil
          </h1>
          <p className="text-base md:text-lg lg:text-2xl text-white font-kalam">
            A Tree of ideas that doesn't stop growing
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 font-body text-base md:text-lg bg-[#3ECF8E] text-black hover:bg-[#34b87a]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
