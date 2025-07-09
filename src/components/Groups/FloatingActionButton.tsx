import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Send, Users, X } from "lucide-react";

interface FloatingActionButtonProps {
  onAddExpense?: () => void;
}

const FloatingActionButton = ({ onAddExpense }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: DollarSign,
      label: "Add Expense",
      color: "bg-blue-500",
      onClick: () => {
        if (onAddExpense) onAddExpense();
        console.log("Add Expense clicked");
      },
    },
    {
      icon: Send,
      label: "Request Money",
      color: "bg-purple-500",
      onClick: () => console.log("Request Money clicked"),
    },
    {
      icon: Users,
      label: "Settle Up",
      color: "bg-green-500",
      onClick: () => console.log("Settle Up clicked"),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="bg-white/90 backdrop-blur-glass px-3 py-1 rounded-full text-sm font-medium text-foreground shadow-glass border border-white/20">
                {action.label}
              </span>
              <Button
                size="icon"
                className={`${action.color} hover:scale-110 transform transition-all duration-300 shadow-glow w-12 h-12 text-white`}
                onClick={() => {
                  if (action.onClick) action.onClick();
                  setIsOpen(false);
                }}
              >
                <action.icon className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-primary hover:shadow-glow hover:scale-110 transform transition-all duration-300 ${
          isOpen ? "rotate-45" : ""
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
