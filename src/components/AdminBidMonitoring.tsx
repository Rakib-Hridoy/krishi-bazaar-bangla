import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getExpiredBids, 
  getBidStatistics, 
  abandonExpiredBids,
  updateBidStatus 
} from '@/backend/services/bidService';
import { AdminBidActions } from '@/components/AdminBidActions';
import { useToast } from '@/hooks/use-toast';
import { Bid } from '@/types';
import { format } from 'date-fns';

export function AdminBidMonitoring() {
  const [expiredBids, setExpiredBids] = useState<Bid[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expiredData, statsData] = await Promise.all([
        getExpiredBids(),
        getBidStatistics()
      ]);
      setExpiredBids(expiredData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "ত্রুটি",
        description: "ডেটা লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonExpired = async () => {
    setActionLoading('abandon-expired');
    try {
      const count = await abandonExpiredBids();
      toast({
        title: "সম্পন্ন",
        description: `${count}টি মেয়াদোত্তীর্ণ বিড বাতিল করা হয়েছে।`
      });
      fetchData();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "মেয়াদোত্তীর্ণ বিড বাতিল করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceAbandon = async (bidId: string) => {
    setActionLoading(bidId);
    try {
      await updateBidStatus(bidId, 'abandoned');
      toast({
        title: "বিড বাতিল করা হয়েছে",
        description: "বিড জোরপূর্বক বাতিল করা হয়েছে।"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বিড বাতিল করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const ExpiredBidCard = ({ bid }: { bid: Bid }) => {
    const timePassed = bid.confirmationDeadline 
      ? Math.floor((new Date().getTime() - new Date(bid.confirmationDeadline).getTime()) / (1000 * 60 * 60))
      : 0;

    return (
      <Card className="mb-4 border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium">{bid.productTitle}</h4>
              <p className="text-sm text-muted-foreground">ক্রেতা: {bid.buyerName}</p>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              {timePassed}ঘ মেয়াদোত্তীর্ণ
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <span className="text-muted-foreground">বিড পরিমাণ:</span>
              <p className="font-bold text-lg">৳{bid.amount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">মেয়াদ শেষ:</span>
              <p>{bid.confirmationDeadline ? format(new Date(bid.confirmationDeadline), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
            </div>
          </div>

          <Button 
            onClick={() => handleForceAbandon(bid.id)}
            disabled={actionLoading === bid.id}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            {actionLoading === bid.id ? 'বাতিল করা হচ্ছে...' : 'জোরপূর্বক বাতিল করুন'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">ডেটা লোড হচ্ছে...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">বিড মনিটরিং</h2>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="মোট বিড" 
          value={statistics.total || 0}
          icon={TrendingUp}
          color="text-blue-600"
        />
        <StatCard 
          title="অপেক্ষমান" 
          value={statistics.pending || 0}
          icon={Clock}
          color="text-yellow-600"
        />
        <StatCard 
          title="গৃহীত" 
          value={statistics.accepted || 0}
          icon={Users}
          color="text-green-600"
        />
        <StatCard 
          title="পরিত্যক্ত" 
          value={statistics.abandoned || 0}
          icon={AlertTriangle}
          color="text-red-600"
          description={`${((statistics.abandoned || 0) / (statistics.total || 1) * 100).toFixed(1)}% হার`}
        />
      </div>

      {/* Action Buttons */}
      <AdminBidActions onRefresh={fetchData} />
      
      {expiredBids.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    {expiredBids.length}টি মেয়াদোত্তীর্ণ বিড পাওয়া গেছে
                  </p>
                  <p className="text-sm text-orange-700">
                    এই বিডগুলো স্বয়ংক্রিয়ভাবে বাতিল করুন
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAbandonExpired}
                disabled={actionLoading === 'abandon-expired'}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {actionLoading === 'abandon-expired' ? 'প্রক্রিয়াকরণ...' : 'সব বাতিল করুন'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Views */}
      <Tabs defaultValue="expired" className="w-full">
        <TabsList>
          <TabsTrigger value="expired">
            মেয়াদোত্তীর্ণ বিড ({expiredBids.length})
          </TabsTrigger>
          <TabsTrigger value="statistics">
            পরিসংখ্যান
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="expired" className="mt-6">
          {expiredBids.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">কোনো মেয়াদোত্তীর্ণ বিড নেই</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {expiredBids.map(bid => (
                <ExpiredBidCard key={bid.id} bid={bid} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>বিডের অবস্থা বিতরণ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statistics).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>সফলতার হার</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>সম্পন্ন হার</span>
                      <span>{((statistics.completed || 0) / (statistics.total || 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(statistics.completed || 0) / (statistics.total || 1) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>পরিত্যাগের হার</span>
                      <span>{((statistics.abandoned || 0) / (statistics.total || 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(statistics.abandoned || 0) / (statistics.total || 1) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}