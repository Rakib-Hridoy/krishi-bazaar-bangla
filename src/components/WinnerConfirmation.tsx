import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Bid } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime } from 'date-fns-tz';

interface WinnerConfirmationProps {
  bid: Bid;
  onStatusUpdate: () => void;
}

export default function WinnerConfirmation({ bid, onStatusUpdate }: WinnerConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      
      const { error } = await supabase
        .from('bids')
        .update({ status: 'confirmed' })
        .eq('id', bid.id);

      if (error) throw error;

      toast({
        title: "নিলাম নিশ্চিত করা হয়েছে",
        description: "আপনি সফলভাবে নিলাম জয়ের বিষয়টি নিশ্চিত করেছেন।"
      });

      onStatusUpdate();
    } catch (error: any) {
      console.error('Error confirming auction win:', error);
      toast({
        title: "নিশ্চিত করতে সমস্যা",
        description: error.message || "নিশ্চিত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const getTimeRemaining = () => {
    if (!bid.confirmationDeadline) return 'সময়সীমা নেই';
    
    const deadline = toZonedTime(new Date(bid.confirmationDeadline), 'Asia/Dhaka');
    const now = toZonedTime(new Date(), 'Asia/Dhaka');
    const timeDiff = deadline.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'সময় শেষ';
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} ঘন্টা ${minutes} মিনিট`;
  };

  const getStatusBadge = () => {
    switch (bid.status) {
      case 'won':
        return <Badge className="bg-amber-500 hover:bg-amber-600"><Trophy className="h-3 w-3 mr-1" />বিজয়ী</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">নিশ্চিত</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">পরিত্যক্ত</Badge>;
      default:
        return <Badge variant="outline">{bid.status}</Badge>;
    }
  };

  const isExpired = bid.confirmationDeadline && toZonedTime(new Date(), 'Asia/Dhaka') > toZonedTime(new Date(bid.confirmationDeadline), 'Asia/Dhaka');

  return (
    <Card className="border-2 border-amber-200 shadow-lg">
      <CardHeader className="bg-amber-50">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Trophy className="h-5 w-5" />
          অভিনন্দন! আপনি নিলামে জিতেছেন
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">বিজয়ী বিড:</span>
            <span className="text-lg font-bold text-agriculture-green-dark">৳{bid.amount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">অবস্থা:</span>
            {getStatusBadge()}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">বাকি সময়:</span>
            <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
              <Clock className="h-3 w-3 inline mr-1" />
              {getTimeRemaining()}
            </span>
          </div>
        </div>

        {bid.status === 'won' && !isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              আপনি এই নিলামে জিতেছেন! ৬ ঘন্টার মধ্যে বিক্রেতার সাথে যোগাযোগ করুন এবং আপনার জয় নিশ্চিত করুন।
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleConfirm}
                disabled={isConfirming}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isConfirming ? 'নিশ্চিত করা হচ্ছে...' : 'জয় নিশ্চিত করুন'}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                বিক্রেতার সাথে যোগাযোগ
              </Button>
            </div>
          </div>
        )}

        {bid.status === 'won' && isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              দুঃখিত, আপনার নিশ্চিতকরণের সময়সীমা শেষ হয়ে গেছে। এই বিডটি এখন পরিত্যক্ত বলে বিবেচিত হবে।
            </p>
          </div>
        )}

        {bid.status === 'confirmed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              অভিনন্দন! আপনি সফলভাবে আপনার নিলাম জয় নিশ্চিত করেছেন। এখন বিক্রেতার সাথে পণ্য সংগ্রহের ব্যবস্থা করুন।
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}