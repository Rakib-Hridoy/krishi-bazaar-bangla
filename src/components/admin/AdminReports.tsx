import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ReportData {
  totalUsers: number;
  totalProducts: number;
  totalBids: number;
  totalRevenue: number;
  usersByRole: { role: string; count: number; color: string }[];
  productsByCategory: { category: string; count: number; color: string }[];
  revenueByMonth: { month: string; revenue: number }[];
}

const AdminReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('6 months');
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [reportPeriod]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total counts
      const [usersResult, productsResult, bidsResult] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('products').select('category', { count: 'exact' }),
        supabase.from('bids').select('amount', { count: 'exact' })
      ]);

      // Calculate totals
      const totalUsers = usersResult.count || 0;
      const totalProducts = productsResult.count || 0;
      const totalBids = bidsResult.count || 0;
      
      // Calculate total revenue from accepted bids
      const { data: acceptedBids } = await supabase
        .from('bids')
        .select('amount')
        .eq('status', 'accepted');
      
      const totalRevenue = acceptedBids?.reduce((sum, bid) => sum + Number(bid.amount), 0) || 0;

      // Users by role
      const usersByRole = [
        { role: 'কৃষক', count: 0, color: '#2E7D32' },
        { role: 'ক্রেতা', count: 0, color: '#FF6F00' },
        { role: 'অ্যাডমিন', count: 0, color: '#795548' }
      ];

      usersResult.data?.forEach(user => {
        const roleIndex = user.role === 'seller' ? 0 : user.role === 'buyer' ? 1 : 2;
        usersByRole[roleIndex].count++;
      });

      // Products by category
      const categoryMap = new Map();
      productsResult.data?.forEach(product => {
        const count = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, count + 1);
      });

      const productsByCategory = Array.from(categoryMap.entries()).map(([category, count], index) => ({
        category,
        count,
        color: ['#2E7D32', '#4CAF50', '#FF6F00', '#795548', '#FFC107', '#9C27B0'][index % 6]
      }));

      // Revenue by month (last 6 months)
      const { data: monthlyRevenue } = await supabase
        .from('bids')
        .select('amount, created_at')
        .eq('status', 'accepted')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      const revenueByMonth = new Map();
      monthlyRevenue?.forEach(bid => {
        const month = new Date(bid.created_at).toLocaleDateString('bn-BD', { 
          year: 'numeric', 
          month: 'short' 
        });
        const current = revenueByMonth.get(month) || 0;
        revenueByMonth.set(month, current + Number(bid.amount));
      });

      const revenueData = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({
        month,
        revenue
      }));

      setReportData({
        totalUsers,
        totalProducts,
        totalBids,
        totalRevenue,
        usersByRole: usersByRole.filter(item => item.count > 0),
        productsByCategory,
        revenueByMonth: revenueData
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "রিপোর্ট লোড করতে সমস্যা",
        description: "রিপোর্টের ডেটা লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const reportText = `
AgroBid প্ল্যাটফর্ম রিপোর্ট
তারিখ: ${new Date().toLocaleDateString('bn-BD')}

সারসংক্ষেপ:
- মোট ব্যবহারকারী: ${reportData.totalUsers}
- মোট পণ্য: ${reportData.totalProducts}
- মোট বিড: ${reportData.totalBids}
- মোট রেভিনিউ: ৳${reportData.totalRevenue.toLocaleString()}

ব্যবহারকারী বিতরণ:
${reportData.usersByRole.map(item => `- ${item.role}: ${item.count}`).join('\n')}

পণ্য বিতরণ:
${reportData.productsByCategory.map(item => `- ${item.category}: ${item.count}`).join('\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrobid-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "রিপোর্ট ডাউনলোড করা হয়েছে",
      description: "রিপোর্ট সফলভাবে ডাউনলোড করা হয়েছে।"
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">রিপোর্ট লোড হচ্ছে...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">রিপোর্ট ডেটা লোড করতে সমস্যা হয়েছে</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">প্ল্যাটফর্ম রিপোর্ট</h2>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 month">১ মাস</SelectItem>
              <SelectItem value="3 months">৩ মাস</SelectItem>
              <SelectItem value="6 months">৬ মাস</SelectItem>
              <SelectItem value="1 year">১ বছর</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            রিপোর্ট ডাউনলোড
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট ব্যবহারকারী</p>
                <p className="text-2xl font-bold">{reportData.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-agriculture-green-dark" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট পণ্য</p>
                <p className="text-2xl font-bold">{reportData.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-agriculture-amber" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট বিড</p>
                <p className="text-2xl font-bold">{reportData.totalBids}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট রেভিনিউ</p>
                <p className="text-2xl font-bold">৳{reportData.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-agriculture-green-dark" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>ব্যবহারকারী বিতরণ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.usersByRole}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ role, count }) => `${role}: ${count}`}
                  >
                    {reportData.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle>পণ্য ক্যাটাগরি</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.productsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2E7D32" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      {reportData.revenueByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>মাসিক রেভিনিউ ট্রেন্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `৳${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, 'রেভিনিউ']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2E7D32" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReports;