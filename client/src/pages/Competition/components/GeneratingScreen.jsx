import React from "react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  { text: "Waking up Gemini..." },
  { text: "Analyzing your selected topic..." },
  { text: "Drafting unique challenges..." },
  { text: "Injecting interactive elements..." },
  { text: "Verifying question formats..." },
  { text: "Applying gamification mechanics..." },
  { text: "Finalizing the arena..." },
];

const GeneratingScreen = () => (
  <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative">
    <MultiStepLoader loadingStates={loadingStates} loading={true} duration={2000} loop={false} />
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 text-sm animate-pulse">
      Hold tight, AI is at work...
    </div>
  </div>
);

export default GeneratingScreen;
