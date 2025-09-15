import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalyticsData {
  total_products_listed: number;
  total_products_sold: number;
  total_revenue: number;
  average_product_price: number;
  total_bids_placed: number;
  total_purchases: number;
  total_spent: number;
  average_purchase_price: number;
  success_rate: number;
  rating: number;
  total_reviews: number;
}

interface UserAnalyticsProps {
  userId: string;
  userRole: 'buyer' | 'seller' | 'admin';
  isOwnProfile?: boolean;
}

const UserAnalytics = ({ userId, userRole, isOwnProfile = false }: UserAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserAnalytics();
  }, [userId]);

  const fetchUserAnalytics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user analytics:', error);
        return;
      }

      if (data) {
        setAnalytics({
          total_products_listed: Number(data.total_products_listed),
          total_products_sold: Number(data.total_products_sold),
          total_revenue: Number(data.total_revenue),
          average_product_price: Number(data.average_product_price),
          total_bids_placed: Number(data.total_bids_placed),
          total_purchases: Number(data.total_purchases),
          total_spent: Number(data.total_spent),
          average_purchase_price: Number(data.average_purchase_price),
          success_rate: Number(data.success_rate),
          rating: Number(data.rating),
          total_reviews: Number(data.total_reviews)
        });
      } else {
        // Initialize empty analytics if none exist
        setAnalytics({
          total_products_listed: 0,
          total_products_sold: 0,
          total_revenue: 0,
          average_product_price: 0,
          total_bids_placed: 0,
          total_purchases: 0,
          total_spent: 0,
          average_purchase_price: 0,
          success_rate: 0,
          rating: 0,
          total_reviews: 0
        });
      }
    } catch (error) {
      console.error('Error in fetchUserAnalytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">অ্যানালিটিক্স লোড হচ্ছে...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">কোন অ্যানালিটিক্স ডেটা পাওয়া যায়নি</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = userRole === 'seller' 
    ? analytics.total_products_listed > 0 
      ? (analytics.total_products_sold / analytics.total_products_listed) * 100 
      : 0
    : analytics.total_bids_placed > 0 
      ? (analytics.total_purchases / analytics.total_bids_placed) * 100 
      : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userRole === 'seller' ? (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট পণ্য</p>
                    <p className="text-2xl font-bold">{analytics.total_products_listed}</p>
                  </div>
                  <Package className="h-8 w-8 text-agriculture-green-dark" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">বিক্রিত পণ্য</p>
                    <p className="text-2xl font-bold">{analytics.total_products_sold}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট আয়</p>
                    <p className="text-2xl font-bold">৳{analytics.total_revenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-agriculture-amber" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">সফলতার হার</p>
                    <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                  </div>
                  <Star className="h-8 w-8 text-agriculture-amber" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট বিড</p>
                    <p className="text-2xl font-bold">{analytics.total_bids_placed}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-agriculture-green-dark" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">সফল ক্রয়</p>
                    <p className="text-2xl font-bold">{analytics.total_purchases}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট খরচ</p>
                    <p className="text-2xl font-bold">৳{analytics.total_spent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-agriculture-amber" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">সফলতার হার</p>
                    <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                  </div>
                  <Star className="h-8 w-8 text-agriculture-amber" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>পারফরমেন্স মেট্রিক্স</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>সফলতার হার</span>
                <span>{successRate.toFixed(1)}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
            
            {analytics.rating > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>রেটিং</span>
                  <span>{analytics.rating.toFixed(1)}/5</span>
                </div>
                <Progress value={(analytics.rating / 5) * 100} className="h-2" />
              </div>
            )}
            
            <div className="pt-2">
              <Badge variant="secondary" className="mr-2">
                {analytics.total_reviews} রিভিউ
              </Badge>
              {userRole === 'seller' && (
                <Badge variant="outline">
                  গড় দাম: ৳{analytics.average_product_price.toLocaleString()}
                </Badge>
              )}
              {userRole === 'buyer' && (
                <Badge variant="outline">
                  গড় ক্রয়: ৳{analytics.average_purchase_price.toLocaleString()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'seller' ? 'বিক্রয় পরিসংখ্যান' : 'ক্রয় পরিসংখ্যান'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userRole === 'seller' ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">তালিকাভুক্ত পণ্য</span>
                  <span className="font-medium">{analytics.total_products_listed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">বিক্রিত পণ্য</span>
                  <span className="font-medium">{analytics.total_products_sold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">মোট আয়</span>
                  <span className="font-medium">৳{analytics.total_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">গড় বিক্রয় মূল্য</span>
                  <span className="font-medium">৳{analytics.average_product_price.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">মোট বিড</span>
                  <span className="font-medium">{analytics.total_bids_placed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">সফল ক্রয়</span>
                  <span className="font-medium">{analytics.total_purchases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">মোট খরচ</span>
                  <span className="font-medium">৳{analytics.total_spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">গড় ক্রয় মূল্য</span>
                  <span className="font-medium">৳{analytics.average_purchase_price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalytics;