
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  id: string;
  name: string;
  isActive: boolean;
}

const CategoryButton = ({ id, name, isActive }: CategoryButtonProps) => {
  return (
    <Link
      to={`/?category=${id}`}
      className={cn(
        "px-4 py-2 rounded-full text-sm transition-colors",
        isActive
          ? "bg-agriculture-green-dark text-white hover:bg-agriculture-green-light"
          : "border hover:bg-gray-100"
      )}
    >
      {name}
    </Link>
  );
};

export const categories = [
  { id: 'all', name: 'সব' },
  { id: 'rice', name: 'ধান/চাল' },
  { id: 'vegetables', name: 'শাকসবজি' },
  { id: 'fruits', name: 'ফল' },
  { id: 'fish', name: 'মাছ' },
  { id: 'meat', name: 'মাংস' },
  { id: 'spices', name: 'মসলা' },
  { id: 'fertilizer', name: 'সার' },
  { id: 'pesticide', name: 'কীটনাশক' },
];

export default CategoryButton;
