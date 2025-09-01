
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Product } from "@/types";
import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { hasAcceptedBid } from "@/backend/services/bidService";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showChat, setShowChat] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkBidStatus = async () => {
      if (user && user.id !== product.sellerId) {
        const hasAccepted = await hasAcceptedBid(user.id, product.id);
        setCanMessage(hasAccepted);
      }
    };
    
    checkBidStatus();
  }, [user, product.id, product.sellerId]);

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowChat(true);
  };

  return (
    <>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg relative">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
            <p className="text-muted-foreground text-sm mb-2">{product.location}</p>
            <div className="flex justify-between items-center">
              <p className="font-bold text-agriculture-green-dark">
                ৳{product.price} / {product.unit}
              </p>
              <p className="text-sm text-agriculture-amber">
                পরিমাণ: {product.quantity} {product.unit}
              </p>
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
