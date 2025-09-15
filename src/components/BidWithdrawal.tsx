import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bid } from '@/types';

interface BidWithdrawalProps {
  bid: Bid;
  onWithdrawSuccess: () => void;
}

const BidWithdrawal = ({ bid, onWithdrawSuccess }: BidWithdrawalProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      
      const { error } = await supabase.rpc('withdraw_bid', {
        bid_id_param: bid.id
      });

      if (error) {
        throw error;
      }

      toast({
        title: "বিড প্রত্যাহার করা হয়েছে",
        description: "আপনার বিড সফলভাবে প্রত্যাহার করা হয়েছে।"
      });

      onWithdrawSuccess();
    } catch (error: any) {
      console.error('Error withdrawing bid:', error);
      toast({
        title: "বিড প্রত্যাহার করতে সমস্যা",
        description: error.message || "বিড প্রত্যাহার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Only show withdrawal option for pending bids
  if (bid.status !== 'pending') {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          বিড প্রত্যাহার করুন
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>বিড প্রত্যাহার নিশ্চিত করুন</AlertDialogTitle>
          <AlertDialogDescription>
            আপনি কি নিশ্চিত যে আপনি ৳{bid.amount.toLocaleString()} টাকার এই বিড প্রত্যাহার করতে চান? 
            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isWithdrawing ? 'প্রত্যাহার হচ্ছে...' : 'হ্যাঁ, প্রত্যাহার করুন'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BidWithdrawal;