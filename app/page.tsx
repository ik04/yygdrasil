// app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold text-[#3ECF8E]">
          Yygdrasil
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="border-white text-black hover:text-black hover:bg-white"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#3ECF8E] text-black hover:bg-[#34b87a]">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-6 py-10 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#3ECF8E]">
            Yygdrasil
          </h1>
          <p className="text-lg text-white">
            A Tree of ideas that doesn't stop growing
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button className="px-6 py-3 text-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
