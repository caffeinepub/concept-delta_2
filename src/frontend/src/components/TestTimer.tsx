import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface TestTimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
}

export default function TestTimer({ durationSeconds, onTimeUp }: TestTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 60;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-colors ${
        isUrgent
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-navy/10 text-navy border border-navy/20'
      }`}
    >
      <Timer className={`h-5 w-5 ${isUrgent ? 'animate-pulse' : ''}`} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
