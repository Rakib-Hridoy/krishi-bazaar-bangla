import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BidStats {
  averageAmount: number;
  totalBids: number;
  highestBid: number;
  lowestBid: number;
}

export function useBidStats(productId?: string) {
  const [stats, setStats] = useState<BidStats>({
    averageAmount: 0,
    totalBids: 0,
    highestBid: 0,
    lowestBid: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBidStats = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bids')
          .select('amount')
          .eq('product_id', productId);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const amounts = data.map(bid => Number(bid.amount));
          const sum = amounts.reduce((acc, amount) => acc + amount, 0);
          const average = sum / amounts.length;
          const highest = Math.max(...amounts);
          const lowest = Math.min(...amounts);

          setStats({
            averageAmount: Math.round(average),
            totalBids: amounts.length,
            highestBid: highest,
            lowestBid: lowest
          });
        } else {
          setStats({
            averageAmount: 0,
            totalBids: 0,
            highestBid: 0,
            lowestBid: 0
          });
        }
      } catch (error) {
        console.error('Error fetching bid stats:', error);
        setStats({
          averageAmount: 0,
          totalBids: 0,
          highestBid: 0,
          lowestBid: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBidStats();
  }, [productId]);

  return { stats, isLoading };
}