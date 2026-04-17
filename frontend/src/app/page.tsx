import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-brand-primary p-6 rounded-[2rem] mb-6 shadow-2xl shadow-brand-primary/20">
            <Leaf className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-heading font-black text-brand-primary tracking-tight">SegriFy</h1>
          <p className="text-xl text-brand-muted-foreground mt-4 font-medium max-w-lg mx-auto">
            A real-time, data-driven civic infrastructure system that transforms waste segregation into an incentivized behavioral ecosystem.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link 
            href="/login" 
            className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/signup" 
            className="bg-white text-brand-primary px-8 py-4 rounded-2xl font-bold text-lg border border-brand-secondary/30 shadow-sm hover:bg-brand-bg transition-all flex items-center justify-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
