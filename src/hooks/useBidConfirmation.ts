import { useState, useEffect } from 'react';
import { getUserBids } from '@/backend/services/bidService';
import { Bid } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useBidConfirmation() {
  const [pendingConfirmationBids, setPendingConfirmationBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPendingBids = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const allBids = await getUserBids(user.id);
      const acceptedBids = allBids.filter(bid => bid.status === 'accepted');
      setPendingConfirmationBids(acceptedBids);
    } catch (error) {
      console.error('Error fetching pending confirmation bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBids();
    
    // Set up periodic refresh to check for expired bids
    const interval = setInterval(fetchPendingBids, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const refreshBids = () => {
    fetchPendingBids();
  };

  return {
    pendingConfirmationBids,
    loading,
    refreshBids,
    hasUrgentBids: pendingConfirmationBids.some(bid => {
      if (!bid.confirmationDeadline) return false;
      const deadline = new Date(bid.confirmationDeadline);
      const now = new Date();
      const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursLeft <= 1; // Less than 1 hour left
    })
  };
}