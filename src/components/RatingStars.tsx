
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  outOf?: number;
}

export default function RatingStars({ rating, outOf = 5 }: RatingStarsProps) {
  // Calculate how many full and half stars we need
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(outOf)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars 
              ? "text-agriculture-amber fill-agriculture-amber" 
              : i === fullStars && hasHalfStar
              ? "text-agriculture-amber fill-agriculture-amber/50"
              : "text-agriculture-amber/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
    </div>
  );
}
