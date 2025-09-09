import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminBidActionsProps {
  onRefresh: () => void;
}

export function AdminBidActions({ onRefresh }: AdminBidActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleManualCleanup = async () => {
    setLoading('cleanup');
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-expired-bids');
      
      if (error) throw error;
      
      toast({
        title: "স্বয়ংক্রিয় পরিচ্ছন্নতা সম্পন্ন",
        description: `${data.abandonedBids}টি মেয়াদোত্তীর্ণ বিড বাতিল করা হয়েছে এবং ${data.suspendedUsers}জন ব্যবহারকারী সাসপেন্ড করা হয়েছে।`
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Manual cleanup error:', error);
      toast({
        title: "পরিচ্ছন্নতায় সমস্যা",
        description: error.message || "স্বয়ংক্রিয় পরিচ্ছন্নতায় সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Zap className="w-5 h-5" />
          এডমিন অ্যাকশন
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleManualCleanup}
            disabled={loading === 'cleanup'}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {loading === 'cleanup' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                পরিচ্ছন্নতা চলছে...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                ম্যানুয়াল পরিচ্ছন্নতা
              </>
            )}
          </Button>
          
          <Button
            onClick={onRefresh}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            ডেটা রিফ্রেশ
          </Button>
        </div>
        
        <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded">
          <p className="font-medium mb-1">স্বয়ংক্রিয় বৈশিষ্ট্য:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>৬ ঘন্টার পর গৃহীত বিড স্বয়ংক্রিয়ভাবে বাতিল</li>
            <li>৩ বার বিড পরিত্যাগের পর ৭ দিন সাসপেনশন</li>
            <li>স্বয়ংক্রিয় নোটিফিকেশন পাঠানো</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}