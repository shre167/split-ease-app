import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PaymentCardProps {
  id: string;
  category: string;
  categoryIcon: string;
  description: string;
  amount: number;
  date: string;
  status: 'settled' | 'pending' | 'auto-detected';
  type: 'received' | 'spent';
}

const PaymentCard = ({ 
  category, 
  categoryIcon, 
  description, 
  amount, 
  date, 
  status, 
  type 
}: PaymentCardProps) => {
  const { formatCurrency } = useCurrency();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'auto-detected':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="payment-card p-4 bg-card border-border card-highlight rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-xl shadow-inner">
            {categoryIcon}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">{description}</p>
            <p className="text-xs text-muted-foreground font-medium">{category}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end space-y-2">
          <span 
            className={cn(
              "font-semibold text-sm",
              type === 'received' 
                ? "text-success" 
                : "text-danger"
            )}
          >
            {type === 'received' ? '+' : '-'}{formatCurrency(amount)}
          </span>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs px-2 py-1 rounded-full capitalize",
              getStatusColor(status)
            )}
          >
            {status}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default PaymentCard;