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
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
        No indoor instructions recorded for this classroom yet.
      </div>
    );
  }

  // Sort by stepNumber ascending
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-4.5 h-4.5 text-emerald-600" />
            <span>Indoor Directions (How to Reach)</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            From {buildingName} Entrance → {floor} → Room {roomNumber}
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {sortedSteps.length} Steps
        </span>
      </div>

      <hr className="border-slate-100" />

      {/* Numbered Steps List */}
      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {sortedSteps.map((step, idx) => (
          <div key={step.stepNumber || idx} className="relative flex items-start gap-3.5 pl-1">
            {/* Step Number Circle */}
            <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-sm shrink-0">
              {step.stepNumber}
            </div>

            <div className="flex-1 pt-0.5 space-y-2">
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {step.text}
              </p>

              {/* Step Image if available */}
              {step.imageUrl && (
                <div className="relative h-40 w-full max-w-md rounded-2xl overflow-hidden border border-slate-200 shadow-sm mt-2">
                  <Image
                    src={step.imageUrl}
                    alt={`Step ${step.stepNumber}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-sky-400" />
                    <span>Reference Photo</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Final Destination Arrival Badge */}
      <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-2 text-xs text-purple-900 font-bold">
        <ArrowRight className="w-4 h-4 text-purple-600 shrink-0" />
        <span>Arrive at Room {roomNumber} ({floor})</span>
      </div>
    </div>
  );
}
