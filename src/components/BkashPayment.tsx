
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface BkashPaymentProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  purpose: string;
}

const BkashPayment = ({ open, onClose, onSuccess, amount, purpose }: BkashPaymentProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith('01')) {
      toast({
        title: "অবৈধ ফোন নম্বর",
        description: "একটি বৈধ বিকাশ নম্বর দিন (১১ ডিজিট)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate PIN
    if (!pin || pin.length !== 4) {
      toast({
        title: "অবৈধ পিন",
        description: "আপনার ৪ সংখ্যার পিন দিন",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, we would process the payment through Bkash API
    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "পেমেন্ট সফল",
        description: `${amount}৳ পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।`,
      });
      onSuccess();
    }, 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>বিকাশ পেমেন্ট</DialogTitle>
          <DialogDescription>
            {purpose} ({amount}৳)
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              বিকাশ নম্বর
            </label>
            <Input
              id="phone"
              placeholder="01XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="pin" className="text-sm font-medium">
              পিন
            </label>
            <Input
              id="pin"
              type="password"
              placeholder="আপনার বিকাশ পিন"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={processing}
            >
              বাতিল করুন
            </Button>
            <Button 
              type="submit"
              className="bg-[#E2136E] hover:bg-[#c01261]"
              disabled={processing}
            >
              {processing ? 'প্রক্রিয়াকরণ হচ্ছে...' : `${amount}৳ পেমেন্ট করুন`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BkashPayment;
