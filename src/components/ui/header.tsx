"use client";

import Link from "next/link";
import { Navigation } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 lg:px-8 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & College Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-all">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                SNS Campus Navigator
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30">
                AI Block
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              SNS College of Engineering • Campus Wayfinding
            </p>
          </div>
        </Link>

      </div>
    </header>
  );
}
