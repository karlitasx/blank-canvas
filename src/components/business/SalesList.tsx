import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessSale } from "@/hooks/useBusinessFinance";
import { EmptyState } from "@/components/ui/empty-state";

interface Props {
  sales: BusinessSale[];
  onDelete: (id: string) => Promise<void>;
  formatCurrency: (v: number) => string;
}

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito",
  boleto: "Boleto",
  transferencia: "Transferência",
};

const SalesList = ({ sales, onDelete, formatCurrency }: Props) => {
  if (sales.length === 0) {
    return <EmptyState icon={ShoppingCart} title="Nenhuma venda registrada" description="Registre sua primeira venda para começar." />;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-foreground">Vendas recentes</h3>
      {sales.map(sale => (
        <div key={sale.id} className="glass-card p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{formatCurrency(Number(sale.amount))}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {paymentLabels[sale.payment_method] || sale.payment_method}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {new Date(sale.sale_date + "T12:00:00").toLocaleDateString("pt-BR")}
              </span>
              {sale.client_name && (
                <span className="text-xs text-muted-foreground">• {sale.client_name}</span>
              )}
            </div>
            {sale.notes && <p className="text-xs text-muted-foreground mt-1">{sale.notes}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(sale.id)} className="text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SalesList;
