
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Video } from "lucide-react";
import { Product } from "@/types";
import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { hasAcceptedBid } from "@/backend/services/bidService";
import BiddingStatus from "@/components/BiddingStatus";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showChat, setShowChat] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [isBiddingExpired, setIsBiddingExpired] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkBidStatus = async () => {
      if (user && user.id !== product.sellerId) {
        const hasAccepted = await hasAcceptedBid(user.id, product.id);
        setCanMessage(hasAccepted);
      }
    };
    
    // Check if bidding has expired
    if (product.biddingDeadline) {
      const deadline = new Date(product.biddingDeadline);
      const now = new Date();
      setIsBiddingExpired(now > deadline);
    }
    
    checkBidStatus();
  }, [user, product.id, product.sellerId, product.biddingDeadline]);

  // Realtime: enable messaging immediately when seller accepts this buyer's bid
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bids-status-${product.id}-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bids', filter: `product_id=eq.${product.id}` },
        (payload) => {
          const newRow = payload.new as { buyer_id: string; status: string };
          if (newRow && newRow.buyer_id === user.id && newRow.status === 'accepted') {
            setCanMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, product.id]);

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowChat(true);
  };

  return (
    <>
      <Card className={`h-full overflow-hidden transition-all hover:shadow-lg relative ${isBiddingExpired ? 'opacity-60 cursor-not-allowed' : ''}`}>
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden relative">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            {product.videoUrl && (
              <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full">
                <Video className="h-4 w-4" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
            <p className="text-muted-foreground text-sm mb-2">{product.location}</p>
            <div className="flex justify-between items-center">
              <p className="font-bold text-agriculture-green-dark">
                ৳{product.price} / {product.unit}
              </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-agriculture-amber">
                পরিমাণ: {product.quantity} {product.unit}
              </p>
              <BiddingStatus startTime={product.biddingStartTime} deadline={product.biddingDeadline} />
            </div>
            </div>
          </CardContent>
        </Link>
        
        <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">
              {new Date(product.createdAt).toLocaleDateString('bn-BD')}
            </p>
            <p className="text-xs">
              বিক্রেতা: {product.sellerName}
            </p>
          </div>
          
          {user && user.id !== product.sellerId && canMessage && (
            <Button
              onClick={handleMessageClick}
              size="sm"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              মেসেজ
            </Button>
          )}
          {user && user.id !== product.sellerId && !canMessage && (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              বিড এক্সেপ্ট প্রয়োজন
            </Button>
          )}
        </CardFooter>
      </Card>

      {showChat && user && (
        <ChatWindow
          receiverId={product.sellerId}
          receiverName={product.sellerName}
          productId={product.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
