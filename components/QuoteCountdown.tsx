import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  expiryDate: string; // ISO string from backend
  onExpire: () => void;
  disabled?: boolean;
};

type TimeLeft = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const calculateTimeLeft = (expiry: Date): TimeLeft => {
  const diff = expiry.getTime() - new Date().getTime();

  if (diff <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    totalMs: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const QuoteCountdown = ({ expiryDate, onExpire, disabled }: Props) => {
  // ✅ Convert string to Date once
  const expiry = useMemo(() => new Date(expiryDate), [expiryDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(expiry)
  );

  // Prevent multiple calls
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const timer = setInterval(() => {
      const updated = calculateTimeLeft(expiry);
      setTimeLeft(updated);

      if (updated.totalMs <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry, onExpire, disabled]);

  if (disabled) return null;

  return (
    <div className="mt-2 text-red-600 font-semibold">
      Expires in:{" "}
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
};

export default QuoteCountdown;