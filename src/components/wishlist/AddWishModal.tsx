import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Wish } from "./WishCard";

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wish: Omit<Wish, "id" | "createdAt" | "completed">) => void;
  editingWish?: Wish | null;
}

const categories = [
  { name: "Tech", emoji: "💻" },
  { name: "Viagem", emoji: "✈️" },
  { name: "Curso", emoji: "📚" },
  { name: "Saúde", emoji: "💪" },
  { name: "Casa", emoji: "🏠" },
  { name: "Outro", emoji: "🎁" },
];

const priorities = [
  { value: "high", label: "Alta", color: "border-red-400 bg-red-500/20 text-red-400" },
  { value: "medium", label: "Média", color: "border-yellow-400 bg-yellow-500/20 text-yellow-400" },
  { value: "low", label: "Baixa", color: "border-green-400 bg-green-500/20 text-green-400" },
];

const AddWishModal = ({ isOpen, onClose, onSave, editingWish }: AddWishModalProps) => {
  const [name, setName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [savedValue, setSavedValue] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [category, setCategory] = useState("Tech");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (editingWish) {
      setName(editingWish.name);
      setTotalValue(editingWish.totalValue.toString());
      setSavedValue(editingWish.savedValue.toString());
      setPriority(editingWish.priority);
      setCategory(editingWish.category);
      setImageUrl(editingWish.imageUrl || "");
      setLink(editingWish.link || "");
      setTargetDate(editingWish.targetDate);
    } else {
      resetForm();
    }
  }, [editingWish, isOpen]);

  const resetForm = () => {
    setName("");
    setTotalValue("");
    setSavedValue("");
    setPriority("medium");
    setCategory("Tech");
    setImageUrl("");
    setLink("");
    setTargetDate(undefined);
  };

  const handleSubmit = () => {
    if (!name || !totalValue) return;

    onSave({
      name,
      totalValue: parseFloat(totalValue),
      savedValue: parseFloat(savedValue) || 0,
      priority,
      category,
      imageUrl: imageUrl || undefined,
      link: link || undefined,
      targetDate,
    });

    resetForm();
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingWish ? "Editar Desejo" : "Novo Desejo"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative h-32 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl("");
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/50 hover:bg-background/70"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Arraste ou clique para upload</span>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nome do desejo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
              placeholder="Ex: MacBook Pro"
            />
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor total</Label>
              <Input
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="bg-input border-border"
                placeholder="R$ 0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Já economizado</Label>
              <Input
                type="number"
                value={savedValue}
                onChange={(e) => setSavedValue(e.target.value)}
                className="bg-input border-border"
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value as "high" | "medium" | "low")}
                  className={`flex-1 py-2 rounded-lg font-medium border transition-all ${
                    priority === p.value ? p.color : "border-border hover:bg-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    category === cat.name
                      ? "bg-primary/20 border border-primary text-primary"
                      : "bg-muted border border-border hover:bg-muted/80"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Link (opcional)
            </Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="bg-input border-border"
              placeholder="https://loja.com.br/produto"
            />
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>Data meta (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "dd/MM/yyyy") : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 logo-gradient"
              disabled={!name || !totalValue}
            >
              {editingWish ? "Salvar" : "Criar Desejo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWishModal;
