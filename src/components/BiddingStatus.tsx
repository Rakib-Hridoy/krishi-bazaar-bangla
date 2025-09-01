import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface BiddingStatusProps {
  deadline?: string;
}

export default function BiddingStatus({ deadline }: BiddingStatusProps) {
  const [status, setStatus] = useState<'active' | 'ending_soon' | 'expired'>('active');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!deadline) return;

    const updateStatus = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const timeDiff = deadlineDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setStatus('expired');
        setTimeLeft('সময় শেষ');
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days} দিন ${hours} ঘন্টা`);
        setStatus(days <= 1 ? 'ending_soon' : 'active');
      } else if (hours > 0) {
        setTimeLeft(`${hours} ঘন্টা ${minutes} মিনিট`);
        setStatus(hours <= 6 ? 'ending_soon' : 'active');
      } else {
        setTimeLeft(`${minutes} মিনিট`);
        setStatus('ending_soon');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  return (
    <Badge 
      variant={status === 'expired' ? 'destructive' : status === 'ending_soon' ? 'secondary' : 'default'}
      className="text-xs"
    >
      {status === 'expired' ? 'বিডিং শেষ' : `বাকি: ${timeLeft}`}
    </Badge>
  );
}