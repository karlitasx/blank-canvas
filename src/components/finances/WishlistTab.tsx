import { useState, useMemo } from "react";
import { Plus, Star, ArrowUpDown } from "lucide-react";
import WishCard, { Wish } from "@/components/wishlist/WishCard";
import AddWishModal from "@/components/wishlist/AddWishModal";
import WishCalculator from "@/components/wishlist/WishCalculator";
import CompletedWishes from "@/components/wishlist/CompletedWishes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { useSupabaseWishlist } from "@/hooks/useSupabaseWishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = "priority" | "progress" | "value-asc" | "value-desc" | "date";

interface WishlistTabProps {
  onSavingsTransaction?: (amount: number, wishName: string) => void;
}

const WishlistTab = ({ onSavingsTransaction }: WishlistTabProps) => {
  const { wishes, activeWishes, isLoaded, addWish, updateWish, addValueToWish, deleteWish, stats } = useSupabaseWishlist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("priority");

  // Sorting
  const sortedWishes = useMemo(() => {
    const active = [...activeWishes];
    
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return active.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      case "progress":
        return active.sort(
          (a, b) =>
            b.savedValue / b.totalValue - a.savedValue / a.totalValue
        );
      case "value-asc":
        return active.sort((a, b) => a.totalValue - b.totalValue);
      case "value-desc":
        return active.sort((a, b) => b.totalValue - a.totalValue);
      case "date":
        return active.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      default:
        return active;
    }
  }, [activeWishes, sortBy]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleAddValue = async (id: string, value: number) => {
    const wish = wishes.find(w => w.id === id);
    
    await addValueToWish(id, value);

    // Create automatic transaction
    if (onSavingsTransaction && wish) {
      onSavingsTransaction(value, wish.name);
    }

    toast({
      title: "Economia registrada! 💰",
      description: `Você economizou ${formatCurrency(value)} para "${wish?.name}"`,
    });
  };

  const handleSaveWish = async (wishData: Omit<Wish, "id" | "createdAt" | "completed">) => {
    if (editingWish) {
      await updateWish(editingWish.id, wishData);
      setEditingWish(null);
    } else {
      await addWish(wishData);
    }
  };

  const handleEdit = (wish: Wish) => {
    setEditingWish(wish);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteWish(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWish(null);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Meus Objetivos</h2>
            <p className="text-sm text-muted-foreground">
              {activeWishes.length} objetivos ativos
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="btn-gradient gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Objetivo
        </Button>
      </div>

      {activeWishes.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhum objetivo ainda"
          description="Adicione seu primeiro objetivo e comece a economizar para conquistá-lo!"
          action={{
            label: "Criar Primeiro Objetivo",
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Já Economizado</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(stats.totalSaved)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Falta</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.totalRemaining)}
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso Geral</span>
                <span className="font-medium">{stats.overallProgress.toFixed(1)}%</span>
              </div>
              <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${stats.overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-muted/50 border-border">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border">
                <DropdownMenuItem
                  onClick={() => setSortBy("priority")}
                  className={sortBy === "priority" ? "bg-muted" : ""}
                >
                  Por Prioridade
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("progress")}
                  className={sortBy === "progress" ? "bg-muted" : ""}
                >
                  Por Progresso
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("value-desc")}
                  className={sortBy === "value-desc" ? "bg-muted" : ""}
                >
                  Maior Valor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("value-asc")}
                  className={sortBy === "value-asc" ? "bg-muted" : ""}
                >
                  Menor Valor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("date")}
                  className={sortBy === "date" ? "bg-muted" : ""}
                >
                  Mais Recentes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Wishes Grid */}
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedWishes.map((wish) => (
                  <WishCard
                    key={wish.id}
                    wish={wish}
                    onAddValue={handleAddValue}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <WishCalculator totalRemaining={stats.totalRemaining} />
              <CompletedWishes wishes={wishes} />
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <AddWishModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveWish}
        editingWish={editingWish}
      />
    </div>
  );
};

export default WishlistTab;
