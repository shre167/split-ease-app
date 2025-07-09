import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <Button
      variant="fab"
      size="icon"
      onClick={onClick}
      className="fixed bottom-20 right-6 w-14 h-14 rounded-full fab-gradient text-white hover:shadow-xl hover:scale-110 transition-all duration-300 z-30"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FloatingActionButton;