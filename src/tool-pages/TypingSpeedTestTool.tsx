import { useEffect, useMemo, useRef, useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { RotateCcw } from "lucide-react";

const PASSAGES = [
  "The quick brown fox jumps over the lazy dog while the sun sets behind the old wooden barn.",
  "Practice makes progress, not perfection, so keep typing every day and watch your speed improve.",
  "A journey of a thousand miles begins with a single step, and every expert was once a beginner.",
  "Octopuses have three hearts and blue blood, which helps them survive in cold, deep ocean water.",
  "Good code is like a good joke, it needs no explanation and still makes sense years later.",
  "The northern lights are caused by charged particles from the sun colliding with the atmosphere.",
  "Coffee was first discovered in Ethiopia after a goat herder noticed his goats acting strangely.",
  "Simplicity is the soul of efficiency, and clarity is the mark of someone who truly understands.",
  "Honey never spoils if it is stored properly, archaeologists have found edible honey in ancient tombs.",
  "The first computer bug was an actual moth found trapped inside a relay back in 1947.",
  "Reading a little every day compounds into a library of knowledge over the course of a lifetime.",
  "Bananas are berries, but strawberries are not, which surprises almost everyone who first hears it.",
  "The best way to predict the future is to build it yourself, one small decision at a time.",
  "Mount Everest grows a few millimeters taller every year because of ongoing tectonic plate collisions.",
  "A well placed comment explains why, never what, since the code already explains what it does.",
];

type Status = "waiting" | "running" | "finished";

function pickPassage(exclude?: string): string {
  const options = exclude ? PASSAGES.filter((p) => p !== exclude) : PASSAGES;
  return options[Math.floor(Math.random() * options.length)];
}

export function TypingSpeedTestTool() {
  const [passage, setPassage] = useState(() => pickPassage());
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("waiting");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<{ wpm: number; accuracy: number; seconds: number; mistakes: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [status]);

  const correctChars = useMemo(() => {
    let count = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === passage[i]) count++;
    }
    return count;
  }, [input, passage]);

  const elapsedSeconds = startTime ? (now - startTime) / 1000 : 0;
  const liveWpm =
    elapsedSeconds > 0.5 ? Math.round(correctChars / 5 / (elapsedSeconds / 60)) : 0;

  const handleChange = (value: string) => {
    if (status === "finished") return;
    if (value.length > passage.length) return;

    let start = startTime;
    let nextStatus: Status = status;
    if (status === "waiting" && value.length > 0) {
      start = Date.now();
      nextStatus = "running";
      setStartTime(start);
      setStatus(nextStatus);
    }

    setInput(value);

    if (value.length === passage.length) {
      const end = Date.now();
      let correct = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === passage[i]) correct++;
      }
      const seconds = start ? (end - start) / 1000 : 0;
      const wpm = seconds > 0 ? Math.round(correct / 5 / (seconds / 60)) : 0;
      const accuracy = Math.round((correct / value.length) * 100);
      setResult({ wpm, accuracy, seconds, mistakes: value.length - correct });
      setStatus("finished");
    }
  };

  const restart = () => {
    setPassage(pickPassage(passage));
    setInput("");
    setStatus("waiting");
    setStartTime(null);
    setResult(null);
    setNow(Date.now());
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <ToolLayout
      title="Typing Speed Test"
      description="Measure your typing speed (WPM) and accuracy in real time. Start typing to begin."
      category="Fun"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="WPM" value={status === "finished" ? result!.wpm : liveWpm} />
          <StatCard
            title="Accuracy"
            value={
              status === "finished"
                ? `${result!.accuracy}%`
                : input.length > 0
                ? `${Math.round((correctChars / input.length) * 100)}%`
                : "100%"
            }
          />
          <StatCard title="Time" value={`${elapsedSeconds.toFixed(1)}s`} />
        </div>

        <div
          className="bg-white border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] font-mono text-lg md:text-xl leading-relaxed tracking-wide cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {passage.split("").map((char, i) => {
            let className = "text-[#111111]/35";
            if (i < input.length) {
              className = input[i] === char ? "text-[#111111]" : "text-red-600 bg-red-100";
            } else if (i === input.length && status !== "finished") {
              className = "text-[#111111] bg-[#FFD400]";
            }
            return (
              <span key={i} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          disabled={status === "finished"}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Click here and start typing the text above..."
          className="w-full border-2 border-[#111111] px-4 py-3 font-mono text-base focus:outline-none focus:bg-white disabled:bg-slate-100 disabled:text-[#111111]/40 transition-colors"
        />

        {status === "finished" && result && (
          <div className="bg-[#FFD400]/20 border-2 border-[#111111] p-6 shadow-[4px_4px_0px_#111111] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-2xl">
                {result.wpm} WPM &middot; {result.accuracy}% accuracy
              </div>
              <div className="text-sm text-[#111111]/60 mt-1">
                {result.seconds.toFixed(1)}s &middot; {result.mistakes} mistake{result.mistakes === 1 ? "" : "s"}
              </div>
            </div>
            <button
              onClick={restart}
              className="flex items-center gap-2 px-5 py-3 bg-[#111111] text-white font-mono text-sm uppercase font-bold hover:bg-[#111111]/90 active:scale-[0.99] transition-all shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {status !== "finished" && (
          <div className="flex justify-end">
            <button
              onClick={restart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#111111] bg-[#111111]/5 hover:bg-[#111111]/10 rounded-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              New Passage
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white border border-[#111111]/10 rounded-sm p-4 text-center flex flex-col justify-center">
      <span className="block text-[11px] font-bold text-[#111111]/50 uppercase tracking-wider mb-2">
        {title}
      </span>
      <span className="block font-extrabold text-3xl md:text-4xl">{value}</span>
    </div>
  );
}
