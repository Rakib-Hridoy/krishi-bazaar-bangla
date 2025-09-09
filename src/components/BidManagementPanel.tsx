import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateBidStatus, getSellerReceivedBids } from '@/backend/services/bidService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Bid } from '@/types';
import { format } from 'date-fns';

export function BidManagementPanel() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBids();
    }
  }, [user]);

  const fetchBids = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const bidData = await getSellerReceivedBids(user.id);
      setBids(bidData);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast({
        title: "ত্রুটি",
        description: "বিড তথ্য লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bidId: string, newStatus: 'accepted' | 'rejected' | 'completed') => {
    setActionLoading(bidId);
    try {
      await updateBidStatus(bidId, newStatus);
      
      const statusMessages = {
        accepted: "বিড গৃহীত হয়েছে",
        rejected: "বিড প্রত্যাখ্যান করা হয়েছে", 
        completed: "লেনদেন সম্পন্ন হয়েছে"
      };
      
      toast({
        title: statusMessages[newStatus],
        description: "বিডের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।"
      });
      
      fetchBids();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বিডের স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="outline" className="bg-gray-50 text-gray-700">অপেক্ষমান</Badge>,
      accepted: <Badge variant="outline" className="bg-yellow-50 text-yellow-700">গৃহীত</Badge>,
      rejected: <Badge variant="outline" className="bg-red-50 text-red-700">প্রত্যাখ্যাত</Badge>,
      confirmed: <Badge variant="outline" className="bg-green-50 text-green-700">নিশ্চিত</Badge>,
      completed: <Badge variant="outline" className="bg-blue-50 text-blue-700">সম্পন্ন</Badge>,
      abandoned: <Badge variant="outline" className="bg-red-100 text-red-800">পরিত্যক্ত</Badge>
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'সময় শেষ';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}ঘ ${minutes}মি বাকি`;
  };

  const filterBids = (status: string[]) => {
    return bids.filter(bid => status.includes(bid.status));
  };

  const BidCard = ({ bid }: { bid: Bid }) => {
    const timeRemaining = getTimeRemaining(bid.confirmationDeadline);
    const isExpired = timeRemaining === 'সময় শেষ';
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium">{bid.productTitle}</h4>
              <p className="text-sm text-muted-foreground">ক্রেতা: {bid.buyerName}</p>
            </div>
            {getStatusBadge(bid.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <span className="text-muted-foreground">বিড পরিমাণ:</span>
              <p className="font-bold text-lg text-primary">৳{bid.amount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">সময়:</span>
              <p>{format(new Date(bid.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>

          {bid.status === 'accepted' && timeRemaining && (
            <div className={`p-2 rounded text-sm mb-3 ${isExpired ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              নিশ্চিতকরণের সময়সীমা: {timeRemaining}
            </div>
          )}

          <div className="flex gap-2">
            {bid.status === 'pending' && (
              <>
                <Button 
                  onClick={() => handleStatusUpdate(bid.id, 'accepted')}
                  disabled={actionLoading === bid.id}
                  size="sm"
                  className="flex-1"
                >
                  গ্রহণ করুন
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(bid.id, 'rejected')}
                  disabled={actionLoading === bid.id}
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  প্রত্যাখ্যান করুন
                </Button>
              </>
            )}
            
            {bid.status === 'confirmed' && (
              <Button 
                onClick={() => handleStatusUpdate(bid.id, 'completed')}
                disabled={actionLoading === bid.id}
                size="sm"
                className="w-full"
              >
                লেনদেন সম্পন্ন করুন
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">বিড তথ্য লোড হচ্ছে...</p>
        </CardContent>
      </Card>
    );
  }

  const pendingBids = filterBids(['pending']);
  const activeBids = filterBids(['accepted', 'confirmed']);
  const completedBids = filterBids(['completed', 'rejected', 'abandoned']);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          বিড ম্যানেজমেন্ট
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              অপেক্ষমান ({pendingBids.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              সক্রিয় ({activeBids.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              সম্পন্ন ({completedBids.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {pendingBids.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">কোনো অপেক্ষমান বিড নেই</p>
            ) : (
              pendingBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-4">
            {activeBids.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">কোনো সক্রিয় বিড নেই</p>
            ) : (
              activeBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {completedBids.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">কোনো সম্পন্ন বিড নেই</p>
            ) : (
              completedBids.map(bid => <BidCard key={bid.id} bid={bid} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}