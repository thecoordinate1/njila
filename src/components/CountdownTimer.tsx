
'use client';

import { useState, useEffect } from 'react';
import { TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiryTimestamp: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState(expiryTimestamp - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = expiryTimestamp - new Date().getTime();
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
        <TimerIcon className="h-3.5 w-3.5 mr-1.5" />
        Expired
      </div>
    );
  }

  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const isLowTime = timeLeft < 5 * 60 * 1000; // 5 minutes

  return (
    <div
      className={cn(
        "flex items-center text-xs font-medium px-2.5 py-1 rounded-full",
        isLowTime 
          ? "text-amber-700 bg-amber-100" 
          : "text-primary bg-primary/10"
      )}
    >
      <TimerIcon className="h-3.5 w-3.5 mr-1.5" />
      <span>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default CountdownTimer;
