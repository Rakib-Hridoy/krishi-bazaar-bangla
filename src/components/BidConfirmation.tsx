import { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateBidStatus } from '@/backend/services/bidService';
import { useToast } from '@/hooks/use-toast';
import { Bid } from '@/types';

interface BidConfirmationProps {
  bid: Bid;
  onStatusUpdate: () => void;
}

export function BidConfirmation({ bid, onStatusUpdate }: BidConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await updateBidStatus(bid.id, 'confirmed');
      toast({
        title: "বিড নিশ্চিত করা হয়েছে",
        description: "আপনি সফলভাবে পণ্যটি কিনতে নিশ্চিত করেছেন।"
      });
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বিড নিশ্চিত করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleAbandon = async () => {
    setIsAbandoning(true);
    try {
      await updateBidStatus(bid.id, 'abandoned');
      toast({
        title: "বিড বাতিল করা হয়েছে",
        description: "আপনি পণ্যটি কিনতে অস্বীকার করেছেন।"
      });
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বিড বাতিল করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsAbandoning(false);
    }
  };

  const getTimeRemaining = () => {
    if (!bid.confirmationDeadline) return null;
    
    const deadline = new Date(bid.confirmationDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'সময় শেষ';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} ঘন্টা ${minutes} মিনিট বাকি`;
  };

  const getStatusBadge = () => {
    switch (bid.status) {
      case 'accepted':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          নিশ্চিতকরণের অপেক্ষায়
        </Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          নিশ্চিত করা হয়েছে
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          সম্পন্ন হয়েছে
        </Badge>;
      case 'abandoned':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          বাতিল করা হয়েছে
        </Badge>;
      default:
        return null;
    }
  };

  const timeRemaining = getTimeRemaining();
  const isExpired = timeRemaining === 'সময় শেষ';
  const showActions = bid.status === 'accepted' && !isExpired;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">বিড নিশ্চিতকরণ প্রয়োজন</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">বিড পরিমাণ:</span>
            <p className="text-lg font-bold text-primary">৳{bid.amount.toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">সময়সীমা:</span>
            <p className={`${isExpired ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
              {timeRemaining || 'নির্ধারিত নেই'}
            </p>
          </div>
        </div>

        {bid.status === 'accepted' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">গুরুত্বপূর্ণ তথ্য:</p>
                <p className="text-yellow-700">
                  আপনার বিড গৃহীত হয়েছে। {timeRemaining && `${timeRemaining} এর মধ্যে`} আপনাকে 
                  পণ্য কিনতে নিশ্চিত করতে হবে। অন্যথায় বিড বাতিল হয়ে যাবে এবং আপনার রেটিং প্রভাবিত হবে।
                </p>
              </div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-3">
            <Button 
              onClick={handleConfirm} 
              disabled={isConfirming}
              className="flex-1"
            >
              {isConfirming ? 'নিশ্চিত করা হচ্ছে...' : 'পণ্য কিনতে নিশ্চিত করুন'}
            </Button>
            <Button 
              onClick={handleAbandon} 
              disabled={isAbandoning}
              variant="outline"
              className="flex-1"
            >
              {isAbandoning ? 'বাতিল করা হচ্ছে...' : 'পণ্য কিনতে চান না'}
            </Button>
          </div>
        )}

        {isExpired && bid.status === 'accepted' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-700 font-medium">
              নিশ্চিতকরণের সময়সীমা শেষ হয়ে গেছে। এই বিড শীঘ্রই বাতিল হয়ে যাবে।
            </p>
          </div>
        )}

        {bid.status === 'confirmed' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-medium">
              পণ্য কেনার জন্য নিশ্চিত করা হয়েছে। বিক্রেতার সাথে যোগাযোগ করুন।
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}