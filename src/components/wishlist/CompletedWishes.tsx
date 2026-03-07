import { Trophy, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wish } from "./WishCard";

interface CompletedWishesProps {
  wishes: Wish[];
}

const CompletedWishes = ({ wishes }: CompletedWishesProps) => {
  const completedWishes = wishes.filter((w) => w.completed);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (completedWishes.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-green-500/20">
          <Trophy className="w-5 h-5 text-green-400" />
        </div>
        <h3 className="font-semibold">Desejos Realizados</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          {completedWishes.length}
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {completedWishes.map((wish) => (
          <div
            key={wish.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {wish.imageUrl ? (
                <img
                  src={wish.imageUrl}
                  alt={wish.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🎯
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="font-medium truncate">{wish.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(wish.totalValue)} •{" "}
                {format(wish.createdAt, "MMM yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-muted text-center">
        <p className="text-sm text-muted-foreground">Total conquistado</p>
        <p className="text-xl font-bold text-green-400">
          {formatCurrency(completedWishes.reduce((sum, w) => sum + w.totalValue, 0))}
        </p>
      </div>
    </div>
  );
};

export default CompletedWishes;
