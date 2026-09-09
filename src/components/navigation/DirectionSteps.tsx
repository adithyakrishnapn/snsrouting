"use client";

import { InstructionStep } from "@/types/department";
import { DoorOpen, ArrowRight, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface DirectionStepsProps {
  steps: InstructionStep[];
  buildingName: string;
  roomNumber: string;
  floor: string;
}

export function DirectionSteps({ steps, buildingName, roomNumber, floor }: DirectionStepsProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        No indoor instructions recorded for this department yet.
      </div>
    );
  }

  // Sort by stepNumber ascending
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Indoor Directions (How to Reach)</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            From {buildingName} Entrance → {floor} → {roomNumber}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
          {sortedSteps.length} Steps
        </span>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Numbered Steps List */}
      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {sortedSteps.map((step, idx) => (
          <div key={step.stepNumber || idx} className="relative flex items-start gap-3.5 pl-1">
            {/* Step Number Circle */}
            <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs shadow-sm shrink-0">
              {step.stepNumber}
            </div>

            <div className="flex-1 pt-0.5 space-y-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {step.text}
              </p>

              {/* Step Image if available */}
              {step.imageUrl && (
                <div className="relative h-36 w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mt-2">
                  <Image
                    src={step.imageUrl}
                    alt={`Step ${step.stepNumber}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Reference Photo</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Final Destination Arrival Badge */}
      <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 rounded-xl flex items-center gap-2 text-xs text-purple-900 dark:text-purple-200 font-bold">
        <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>Arrive at {roomNumber} ({floor})</span>
      </div>
    </div>
  );
}
