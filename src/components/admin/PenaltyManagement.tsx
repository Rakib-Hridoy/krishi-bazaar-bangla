import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, DollarSign } from 'lucide-react';

interface Penalty {
  id: string;
  user_id: string;
  bid_id: string;
  product_id: string;
  penalty_type: string;
  penalty_amount: number;
  description: string;
  status: string;
  applied_at: string;
  resolved_at?: string;
  user_name?: string;
  product_title?: string;
}

const PenaltyManagement = () => {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBidId, setSelectedBidId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [penaltyType, setPenaltyType] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      setIsLoading(true);
      
      const { data: penaltiesData, error } = await supabase
        .from('penalties')
        .select(`
          *,
          profiles!penalties_user_id_fkey(name),
          products!penalties_product_id_fkey(title)
        `)
        .order('applied_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedPenalties: Penalty[] = penaltiesData?.map(penalty => ({
        id: penalty.id,
        user_id: penalty.user_id,
        bid_id: penalty.bid_id,
        product_id: penalty.product_id,
        penalty_type: penalty.penalty_type,
        penalty_amount: Number(penalty.penalty_amount),
        description: penalty.description || '',
        status: penalty.status,
        applied_at: penalty.applied_at,
        resolved_at: penalty.resolved_at,
        user_name: (penalty.profiles as any)?.name || 'অজানা ব্যবহারকারী',
        product_title: (penalty.products as any)?.title || 'অজানা পণ্য'
      })) || [];

      setPenalties(formattedPenalties);
    } catch (error) {
      console.error('Error fetching penalties:', error);
      toast({
        title: "পেনাল্টি লোড করতে সমস্যা",
        description: "পেনাল্টির তথ্য লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPenalty = async () => {
    if (!selectedUserId || !selectedBidId || !selectedProductId || !penaltyType) {
      toast({
        title: "সব ফিল্ড পূরণ করুন",
        description: "অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন।",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsApplying(true);
      
      const { data, error } = await supabase.rpc('apply_penalty', {
        target_user_id: selectedUserId,
        target_bid_id: selectedBidId,
        target_product_id: selectedProductId,
        penalty_type_param: penaltyType,
        penalty_amount_param: penaltyAmount ? Number(penaltyAmount) : 0,
        description_param: description || null
      });

      if (error) {
        throw error;
      }

      toast({
        title: "পেনাল্টি প্রয়োগ করা হয়েছে",
        description: "পেনাল্টি সফলভাবে প্রয়োগ করা হয়েছে।"
      });

      // Reset form and close dialog
      setSelectedUserId('');
      setSelectedBidId('');
      setSelectedProductId('');
      setPenaltyType('');
      setPenaltyAmount('');
      setDescription('');
      setShowApplyDialog(false);
      
      // Refresh penalties list
      fetchPenalties();
    } catch (error: any) {
      console.error('Error applying penalty:', error);
      toast({
        title: "পেনাল্টি প্রয়োগ করতে সমস্যা",
        description: error.message || "পেনাল্টি প্রয়োগ করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleResolvePenalty = async (penaltyId: string, status: 'paid' | 'waived') => {
    try {
      const { error } = await supabase
        .from('penalties')
        .update({ 
          status, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', penaltyId);

      if (error) {
        throw error;
      }

      toast({
        title: "পেনাল্টি আপডেট করা হয়েছে",
        description: `পেনাল্টি ${status === 'paid' ? 'পরিশোধিত' : 'মওকুফ'} হিসেবে চিহ্নিত করা হয়েছে।`
      });

      fetchPenalties();
    } catch (error: any) {
      console.error('Error resolving penalty:', error);
      toast({
        title: "পেনাল্টি আপডেট করতে সমস্যা",
        description: error.message || "পেনাল্টি আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  const getPenaltyTypeText = (type: string) => {
    switch (type) {
      case 'deal_refusal': return 'চুক্তি প্রত্যাখ্যান';
      case 'fake_listing': return 'ভুয়া তালিকা';
      case 'quality_issue': return 'মানের সমস্যা';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">সক্রিয়</Badge>;
      case 'paid':
        return <Badge variant="default">পরিশোধিত</Badge>;
      case 'waived':
        return <Badge variant="secondary">মওকুফ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">পেনাল্টি ব্যবস্থাপনা</h2>
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              নতুন পেনাল্টি প্রয়োগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>পেনাল্টি প্রয়োগ করুন</DialogTitle>
              <DialogDescription>
                ব্যবহারকারীর বিরুদ্ধে পেনাল্টি প্রয়োগ করার জন্য নিচের তথ্য পূরণ করুন।
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">ব্যবহারকারী ID</Label>
                <Input
                  id="user-id"
                  placeholder="ব্যবহারকারী ID"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bid-id">বিড ID</Label>
                <Input
                  id="bid-id"
                  placeholder="বিড ID"
                  value={selectedBidId}
                  onChange={(e) => setSelectedBidId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product-id">পণ্য ID</Label>
                <Input
                  id="product-id"
                  placeholder="পণ্য ID"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="penalty-type">পেনাল্টির ধরন</Label>
                <Select value={penaltyType} onValueChange={setPenaltyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="পেনাল্টির ধরন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deal_refusal">চুক্তি প্রত্যাখ্যান</SelectItem>
                    <SelectItem value="fake_listing">ভুয়া তালিকা</SelectItem>
                    <SelectItem value="quality_issue">মানের সমস্যা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="penalty-amount">পেনাল্টির পরিমাণ (৳)</Label>
                <Input
                  id="penalty-amount"
                  type="number"
                  placeholder="0"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  placeholder="পেনাল্টির কারণ বিস্তারিত লিখুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                বাতিল করুন
              </Button>
              <Button 
                onClick={handleApplyPenalty}
                disabled={isApplying}
                className="bg-red-600 hover:bg-red-700"
              >
                {isApplying ? 'প্রয়োগ হচ্ছে...' : 'পেনাল্টি প্রয়োগ করুন'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            সকল পেনাল্টি
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">পেনাল্টি লোড হচ্ছে...</p>
            </div>
          ) : penalties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">কোন পেনাল্টি পাওয়া যায়নি</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ব্যবহারকারী</TableHead>
                  <TableHead>পণ্য</TableHead>
                  <TableHead>ধরন</TableHead>
                  <TableHead>পরিমাণ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>কার্যকলাপ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {penalties.map((penalty) => (
                  <TableRow key={penalty.id}>
                    <TableCell>{penalty.user_name}</TableCell>
                    <TableCell className="max-w-32 truncate">{penalty.product_title}</TableCell>
                    <TableCell>{getPenaltyTypeText(penalty.penalty_type)}</TableCell>
                    <TableCell>
                      {penalty.penalty_amount > 0 ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ৳{penalty.penalty_amount.toLocaleString()}
                        </div>
                      ) : (
                        'সতর্কতা'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(penalty.status)}</TableCell>
                    <TableCell>
                      {new Date(penalty.applied_at).toLocaleDateString('bn-BD')}
                    </TableCell>
                    <TableCell>
                      {penalty.status === 'active' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolvePenalty(penalty.id, 'paid')}
                          >
                            পরিশোধিত
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleResolvePenalty(penalty.id, 'waived')}
                          >
                            মওকুফ
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PenaltyManagement;