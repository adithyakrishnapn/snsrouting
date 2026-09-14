"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo & College Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-all">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              SNS Campus Navigator
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              SNS College of Engineering
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
