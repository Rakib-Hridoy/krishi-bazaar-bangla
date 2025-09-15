import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface PriceTrendData {
  date: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  total_quantity: number;
}

interface PriceTrendChartProps {
  category: string;
  title?: string;
}

const PriceTrendChart = ({ category, title = "দামের প্রবণতা" }: PriceTrendChartProps) => {
  const [data, setData] = useState<PriceTrendData[]>([]);
  const [timePeriod, setTimePeriod] = useState('6 months');
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    fetchPriceTrends();
  }, [category, timePeriod]);

  const fetchPriceTrends = async () => {
    try {
      setIsLoading(true);
      
      const { data: trendsData, error } = await supabase.rpc('get_price_trends', {
        category_name: category,
        time_period: timePeriod
      });

      if (error) {
        console.error('Error fetching price trends:', error);
        return;
      }

      const formattedData = trendsData?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('bn-BD', { 
          month: 'short', 
          day: 'numeric' 
        }),
        avg_price: Number(item.avg_price),
        min_price: Number(item.min_price),
        max_price: Number(item.max_price),
        total_quantity: Number(item.total_quantity)
      })) || [];

      setData(formattedData.reverse()); // Show chronological order
    } catch (error) {
      console.error('Error in fetchPriceTrends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title} - {category}</CardTitle>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 week">১ সপ্তাহ</SelectItem>
                <SelectItem value="1 month">১ মাস</SelectItem>
                <SelectItem value="3 months">৩ মাস</SelectItem>
                <SelectItem value="6 months">৬ মাস</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">লাইন</SelectItem>
                <SelectItem value="bar">বার</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">ডেটা লোড হচ্ছে...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">এই সময়ের জন্য কোন ডেটা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'avg_price' ? 'গড় দাম' :
                      name === 'min_price' ? 'সর্বনিম্ন দাম' :
                      name === 'max_price' ? 'সর্বোচ্চ দাম' : name
                    ]}
                    labelFormatter={(label) => `তারিখ: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg_price" 
                    stroke="#2E7D32" 
                    strokeWidth={2}
                    name="গড় দাম"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="min_price" 
                    stroke="#FF6F00" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="সর্বনিম্ন দাম"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="max_price" 
                    stroke="#795548" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="সর্বোচ্চ দাম"
                  />
                </LineChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'গড় দাম']}
                    labelFormatter={(label) => `তারিখ: ${label}`}
                  />
                  <Bar dataKey="avg_price" fill="#2E7D32" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;