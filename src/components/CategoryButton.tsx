
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  id: string;
  name: string;
  isActive: boolean;
  icon?: string; // Added icon as an optional prop
  onClick?: () => void; // Added onClick as an optional prop since it's being used
}

const CategoryButton = ({ id, name, isActive, icon, onClick }: CategoryButtonProps) => {
  // If onClick is provided, use a button with onClick, otherwise use a Link
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2",
          isActive
            ? "bg-agriculture-green-dark text-white hover:bg-agriculture-green-light"
            : "border hover:bg-gray-100"
        )}
      >
        {icon && <span>{icon}</span>}
        {name}
      </button>
    );
  }
  
  return (
    <Link
      to={`/?category=${id}`}
      className={cn(
        "px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2",
        isActive
          ? "bg-agriculture-green-dark text-white hover:bg-agriculture-green-light"
          : "border hover:bg-gray-100"
      )}
    >
      {icon && <span>{icon}</span>}
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
