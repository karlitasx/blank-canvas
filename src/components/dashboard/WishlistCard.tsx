import { Star, Plus } from "lucide-react";

const WishlistCard = () => {
  const item = {
    name: "MacBook Pro M3",
    targetPrice: 15000,
    savedAmount: 9500,
    image: "💻",
  };

  const progress = Math.round((item.savedAmount / item.targetPrice) * 100);
  const remaining = item.targetPrice - item.savedAmount;

  return (
    <div className="glass-card p-6 animate-slide-up animation-delay-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg logo-gradient">
          <Star className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">Wishlist</h3>
      </div>

      {/* Priority Item */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-glass flex items-center justify-center text-3xl">
            {item.image}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{item.name}</h4>
            <p className="text-sm text-muted-foreground">Prioridade #1</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{progress}% alcançado</span>
            <span className="font-medium">
              R$ {item.savedAmount.toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="h-3 rounded-full bg-glass overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Remaining */}
        <p className="text-sm text-muted-foreground mb-4">
          Faltam{" "}
          <span className="text-foreground font-semibold">
            R$ {remaining.toLocaleString("pt-BR")}
          </span>
        </p>

        {/* Action Button */}
        <button className="w-full py-3 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover transition-all duration-300 flex items-center justify-center gap-2 group">
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Adicionar à meta</span>
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
