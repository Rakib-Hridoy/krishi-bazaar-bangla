import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductAnalyticsData {
  total_bids: number;
  highest_bid: number;
  lowest_bid: number;
  average_bid: number;
  final_price: number;
  views_count: number;
  interest_score: number;
}

interface ProductAnalyticsProps {
  productId: string;
  currentPrice: number;
}

const ProductAnalytics = ({ productId, currentPrice }: ProductAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<ProductAnalyticsData | null>(null);
  const [bidData, setBidData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProductAnalytics();
    fetchBidDistribution();
  }, [productId]);

  const fetchProductAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('product_analytics')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching product analytics:', error);
        return;
      }

      if (data) {
        setAnalytics({
          total_bids: Number(data.total_bids),
          highest_bid: Number(data.highest_bid),
          lowest_bid: Number(data.lowest_bid),
          average_bid: Number(data.average_bid),
          final_price: Number(data.final_price),
          views_count: Number(data.views_count),
          interest_score: Number(data.interest_score)
        });
      }
    } catch (error) {
      console.error('Error in fetchProductAnalytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBidDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('amount, status, created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching bid distribution:', error);
        return;
      }

      // Group bids by price ranges for visualization
      const priceRanges = [
        { range: '< ৳1000', min: 0, max: 1000, count: 0, color: '#FF6F00' },
        { range: '৳1000-5000', min: 1000, max: 5000, count: 0, color: '#2E7D32' },
        { range: '৳5000-10000', min: 5000, max: 10000, count: 0, color: '#795548' },
        { range: '> ৳10000', min: 10000, max: Infinity, count: 0, color: '#4CAF50' }
      ];

      data?.forEach(bid => {
        const amount = Number(bid.amount);
        const range = priceRanges.find(r => amount >= r.min && amount < r.max);
        if (range) range.count++;
      });

      setBidData(priceRanges.filter(r => r.count > 0));
    } catch (error) {
      console.error('Error in fetchBidDistribution:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">পণ্য অ্যানালিটিক্স লোড হচ্ছে...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট বিড</p>
                <p className="text-2xl font-bold">{analytics?.total_bids || 0}</p>
              </div>
              <Users className="h-8 w-8 text-agriculture-green-dark" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সর্বোচ্চ বিড</p>
                <p className="text-2xl font-bold">৳{analytics?.highest_bid?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">গড় বিড</p>
                <p className="text-2xl font-bold">৳{analytics?.average_bid?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-agriculture-amber" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ভিউ</p>
                <p className="text-2xl font-bold">{analytics?.views_count || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>দামের তুলনা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">আপনার দাম</span>
              <Badge variant="outline">৳{currentPrice.toLocaleString()}</Badge>
            </div>
            
            {analytics?.average_bid && analytics.average_bid > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">গড় বিড</span>
                <Badge variant={analytics.average_bid > currentPrice ? "default" : "secondary"}>
                  ৳{analytics.average_bid.toLocaleString()}
                </Badge>
              </div>
            )}
            
            {analytics?.highest_bid && analytics.highest_bid > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">সর্বোচ্চ বিড</span>
                <Badge variant={analytics.highest_bid > currentPrice ? "default" : "secondary"}>
                  ৳{analytics.highest_bid.toLocaleString()}
                </Badge>
              </div>
            )}
            
            {analytics?.final_price && analytics.final_price > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">চূড়ান্ত বিক্রয় মূল্য</span>
                <Badge variant="default">
                  ৳{analytics.final_price.toLocaleString()}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bid Distribution Chart */}
      {bidData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>বিড বিতরণ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bidData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ range, count }) => `${range}: ${count}`}
                  >
                    {bidData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductAnalytics;