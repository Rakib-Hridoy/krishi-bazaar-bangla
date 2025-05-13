
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
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
        <CardFooter className="px-4 pb-4 pt-0 flex justify-between">
          <p className="text-xs text-muted-foreground">
            {new Date(product.createdAt).toLocaleDateString('bn-BD')}
          </p>
          <p className="text-xs">
            বিক্রেতা: {product.sellerName}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
