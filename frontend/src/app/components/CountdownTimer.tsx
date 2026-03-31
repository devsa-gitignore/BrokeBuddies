import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  label?: string;
}

export function CountdownTimer({ deadline, label = 'Time Remaining' }: CountdownTimerProps) {
  const getTimeRemaining = (targetDeadline: string) => {
    const now = new Date().getTime();
    const target = new Date(targetDeadline).getTime();
    const diff = target - now;

    if (diff <= 0 || Number.isNaN(target)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const [time, setTime] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (time.expired) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Deadline Expired</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Clock className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="flex gap-3">
        {[
          { value: time.days, label: 'Days' },
          { value: time.hours, label: 'Hours' },
          { value: time.minutes, label: 'Min' },
          { value: time.seconds, label: 'Sec' },
        ].map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ scale: 1.05 }}
            className="flex-1 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-lg p-3 border border-[#FFB703]/20 text-center"
          >
            <div className="text-2xl font-bold text-[#FFB703]">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 mt-1">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
