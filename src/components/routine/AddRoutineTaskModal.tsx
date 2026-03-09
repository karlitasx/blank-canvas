import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutine } from "@/hooks/useRoutine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AddRoutineTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { id: "dom", label: "Dom" },
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sáb", label: "Sáb" }
];

const CATEGORIES = [
  { id: "saúde", label: "Saúde", color: "bg-green-100 text-green-700" },
  { id: "espiritual", label: "Espiritual", color: "bg-blue-100 text-blue-700" },
  { id: "trabalho", label: "Trabalho", color: "bg-orange-100 text-orange-700" },
  { id: "casa", label: "Casa", color: "bg-amber-100 text-amber-700" },
  { id: "pessoal", label: "Pessoal", color: "bg-pink-100 text-pink-700" },
  { id: "compras", label: "Compras", color: "bg-indigo-100 text-indigo-700" },
  { id: "beleza", label: "Beleza", color: "bg-rose-100 text-rose-700" },
  { id: "estudar", label: "Estudar", color: "bg-purple-100 text-purple-700" },
  { id: "tempo_qualidade", label: "Tempo de Qualidade", color: "bg-teal-100 text-teal-700" },
];

export const AddRoutineTaskModal = ({ isOpen, onClose }: AddRoutineTaskModalProps) => {
  const { createTask } = useRoutine();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [frequencyType, setFrequencyType] = useState<"daily" | "weekly" | "weekdays" | "weekends">("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [category, setCategory] = useState("saúde");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "extreme">("medium");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const difficultyPoints = {
    easy: 5,
    medium: 10,
    hard: 15,
    extreme: 25
  };

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    
    // Choose emoji based on category
    let emoji = "📋";
    switch (category) {
      case "saúde": emoji = "🏃‍♀️"; break;
      case "espiritual": emoji = "🙏"; break;
      case "trabalho": emoji = "💻"; break;
      case "casa": emoji = "🧹"; break;
      case "estudar": emoji = "📚"; break;
      case "beleza": emoji = "💅"; break;
    }

    await createTask({
      title: title.trim(),
      emoji,
      category,
      difficulty,
      points_value: difficultyPoints[difficulty],
      start_time: startTime || null,
      end_time: endTime || null,
      frequency_type: frequencyType,
      frequency_days: frequencyType === "weekly" ? selectedDays : []
    });

    setLoading(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setFrequencyType("daily");
    setSelectedDays([]);
    setCategory("saúde");
    setDifficulty("medium");
    setStartTime("");
    setEndTime("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              placeholder="Ex: Treino na academia" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Dias da Semana</Label>
            <div className="flex gap-2 mb-2">
              <Button 
                type="button" 
                variant={frequencyType === "weekdays" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFrequencyType("weekdays")}
                className="flex-1 text-xs"
              >
                Dias Úteis
              </Button>
              <Button 
                type="button" 
                variant={frequencyType === "weekends" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFrequencyType("weekends")}
                className="flex-1 text-xs"
              >
                Fim de Semana
              </Button>
              <Button 
                type="button" 
                variant={frequencyType === "daily" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFrequencyType("daily")}
                className="flex-1 text-xs"
              >
                Todos os Dias
              </Button>
              <Button 
                type="button" 
                variant={frequencyType === "weekly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFrequencyType("weekly")}
                className="flex-1 text-xs"
              >
                Personalizado
              </Button>
            </div>

            {frequencyType === "weekly" && (
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day.id}
                    type="button"
                    variant={selectedDays.includes(day.id) ? "default" : "outline"}
                    size="sm"
                    className="w-12 h-10 p-0 rounded-full"
                    onClick={() => handleDayToggle(day.id)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo / Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", cat.color.split(" ")[0])} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">⭐ Fácil (5 pts)</SelectItem>
                <SelectItem value="medium">⚡ Médio (10 pts)</SelectItem>
                <SelectItem value="hard">🔥 Difícil (15 pts)</SelectItem>
                <SelectItem value="extreme">🏆 Extremo (25 pts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Horário início (opcional)</Label>
              <Input 
                id="start" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Horário término (opcional)</Label>
              <Input 
                id="end" 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
