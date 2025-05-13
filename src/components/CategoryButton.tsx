
import { Button } from "@/components/ui/button";

interface CategoryButtonProps {
  name: string;
  icon: string;
  onClick: () => void;
  isActive: boolean;
}

export default function CategoryButton({ name, icon, onClick, isActive }: CategoryButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className={`flex flex-col items-center justify-center h-24 w-full ${
        isActive 
          ? "bg-agriculture-green-dark text-white" 
          : "border-agriculture-green-dark text-agriculture-green-dark hover:bg-agriculture-green-light hover:text-white"
      }`}
      onClick={onClick}
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span>{name}</span>
    </Button>
  );
}
