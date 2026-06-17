import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { Play, Pause, RotateCcw } from "lucide-react";

export function PomodoroTool() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: play sound here
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "pomodoro") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else if (mode === "longBreak") setTimeLeft(15 * 60);
  };

  const switchMode = (newMode: "pomodoro" | "shortBreak" | "longBreak") => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === "pomodoro") setTimeLeft(25 * 60);
    else if (newMode === "shortBreak") setTimeLeft(5 * 60);
    else if (newMode === "longBreak") setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <ToolLayout
      title="Pomodoro Timer"
      description="Focus timer to boost your productivity using the Pomodoro technique."
    >
      <div className="max-w-md mx-auto bg-white border border-[#111111]/10 rounded-sm p-8 text-center shadow-sm">
        <div className="flex justify-center gap-2 mb-8 bg-[#111111]/5 p-1 rounded-sm w-max mx-auto">
          <ModeButton 
            active={mode === "pomodoro"} 
            onClick={() => switchMode("pomodoro")}
          >
            Pomodoro
          </ModeButton>
          <ModeButton 
            active={mode === "shortBreak"} 
            onClick={() => switchMode("shortBreak")}
          >
            Short Break
          </ModeButton>
          <ModeButton 
            active={mode === "longBreak"} 
            onClick={() => switchMode("longBreak")}
          >
            Long Break
          </ModeButton>
        </div>

        <div className="text-[100px] md:text-[120px] font-extrabold font-mono leading-none tracking-tight text-[#111111] mb-10">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-10 py-5 font-bold rounded-sm text-lg transition-colors ${
              isActive 
                ? "bg-[#111111]/10 text-[#111111] hover:bg-[#111111]/20" 
                : "bg-[#111111] text-white hover:bg-[#111111]/90"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-6 h-6" /> Stop
              </>
            ) : (
              <>
                <Play className="w-6 h-6" /> Start
              </>
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-5 bg-white border border-[#111111]/10 text-[#111111] font-semibold rounded-sm hover:border-[#111111]/30 hover:bg-[#111111]/5 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}

function ModeButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${
        active
          ? "bg-white text-[#111111] shadow-sm border border-[#111111]/10"
          : "text-[#111111]/60 hover:text-[#111111] hover:bg-[#111111]/5"
      }`}
    >
      {children}
    </button>
  );
}
