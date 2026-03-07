import { useState } from "react";
import { Edit2, Trash2, Plus, ExternalLink, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

export interface Wish {
  id: string;
  name: string;
  totalValue: number;
  savedValue: number;
  priority: "high" | "medium" | "low";
  category: string;
  imageUrl?: string;
  link?: string;
  targetDate?: Date;
  createdAt: Date;
  completed: boolean;
}

interface WishCardProps {
  wish: Wish;
  onAddValue: (id: string, value: number) => void;
  onEdit: (wish: Wish) => void;
  onDelete: (id: string) => void;
}

const priorityStyles = {
  high: "border-red-400 bg-red-500/10",
  medium: "border-yellow-400 bg-yellow-500/10",
  low: "border-green-400 bg-green-500/10",
};

const priorityLabels = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const priorityColors = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

const WishCard = ({ wish, onAddValue, onEdit, onDelete }: WishCardProps) => {
  const [isAddValueOpen, setIsAddValueOpen] = useState(false);
  const [addValue, setAddValue] = useState("");

  const progress = Math.min((wish.savedValue / wish.totalValue) * 100, 100);
  const remaining = wish.totalValue - wish.savedValue;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleAddValue = () => {
    const value = parseFloat(addValue);
    if (value > 0) {
      const newTotal = wish.savedValue + value;
      onAddValue(wish.id, value);
      
      // Check for milestone achievements
      const oldProgress = (wish.savedValue / wish.totalValue) * 100;
      const newProgress = (newTotal / wish.totalValue) * 100;
      
      if (newProgress >= 100 && oldProgress < 100) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#a855f7", "#ec4899", "#8b5cf6"],
        });
      }
      
      setAddValue("");
      setIsAddValueOpen(false);
    }
  };

  const getMilestones = () => {
    const milestones = [];
    if (progress >= 25) milestones.push(25);
    if (progress >= 50) milestones.push(50);
    if (progress >= 75) milestones.push(75);
    if (progress >= 100) milestones.push(100);
    return milestones;
  };

  return (
    <>
      <div
        className={`glass-card overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl border-2 ${
          priorityStyles[wish.priority]
        } ${wish.completed ? "opacity-75" : ""}`}
      >
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20">
          {wish.imageUrl ? (
            <img
              src={wish.imageUrl}
              alt={wish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-50">🎯</span>
            </div>
          )}
          
          {/* Milestones */}
          {getMilestones().length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {getMilestones().map((milestone) => (
                <div
                  key={milestone}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/50 backdrop-blur-sm"
                >
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">
                    {milestone}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Link */}
          {wish.link && (
            <a
              href={wish.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Completed Badge */}
          {wish.completed && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-400">
                ✓ Conquistado!
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">{wish.name}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(wish)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => onDelete(wish.id)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[wish.priority]} bg-muted`}
            >
              {priorityLabels[wish.priority]}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-primary bg-primary/20">
              {wish.category}
            </span>
          </div>

          {/* Values */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Economizado</span>
            <span className="font-medium text-green-400">
              {formatCurrency(wish.savedValue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Meta</span>
            <span className="font-medium">{formatCurrency(wish.totalValue)}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Faltam {formatCurrency(remaining > 0 ? remaining : 0)}
              </span>
              <span className="font-medium text-primary">{progress.toFixed(1)}%</span>
            </div>
          </div>

          {/* Add Value Button */}
          {!wish.completed && (
            <Button
              onClick={() => setIsAddValueOpen(true)}
              className="w-full logo-gradient gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Valor
            </Button>
          )}
        </div>
      </div>

      {/* Add Value Modal */}
      <Dialog open={isAddValueOpen} onOpenChange={setIsAddValueOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Valor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Quanto você economizou para "{wish.name}"?
            </p>
            <Input
              type="number"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              placeholder="R$ 0,00"
              className="bg-input border-border text-lg"
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsAddValueOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddValue} className="flex-1 logo-gradient">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WishCard;
