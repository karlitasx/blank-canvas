import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreateChallengeInput, CHALLENGE_TYPES, CHALLENGE_EMOJIS, ChallengeType } from "@/types/challenges";
import { Calendar, Target, Users } from "lucide-react";
import { addDays, format } from "date-fns";

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateChallengeInput) => Promise<any>;
}

const CreateChallengeModal = ({ open, onOpenChange, onSubmit }: CreateChallengeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🏆");
  const [challengeType, setChallengeType] = useState<ChallengeType>("habits");
  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetValue || !startDate || !endDate) return;

    setLoading(true);
    try {
      const result = await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        emoji,
        challenge_type: challengeType,
        target_value: parseInt(targetValue),
        start_date: startDate,
        end_date: endDate,
        is_public: isPublic,
      });

      if (result) {
        resetForm();
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEmoji("🏆");
    setChallengeType("habits");
    setTargetValue("");
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setEndDate(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    setIsPublic(true);
  };

  const selectedType = CHALLENGE_TYPES.find(t => t.value === challengeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Novo Desafio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji Selector */}
          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex gap-2 flex-wrap">
              {CHALLENGE_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 30 dias de hábitos saudáveis"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Regras e detalhes do desafio..."
              rows={2}
            />
          </div>

          {/* Challenge Type */}
          <div className="space-y-2">
            <Label>Tipo de Desafio</Label>
            <Select value={challengeType} onValueChange={(v) => setChallengeType(v as ChallengeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHALLENGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.emoji}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="target">Meta ({selectedType?.unit}) *</Label>
            <Input
              id="target"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={`Ex: ${selectedType?.value === 'savings' ? '1000' : '30'}`}
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Início *
              </Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Fim *</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Public Switch */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="public" className="cursor-pointer">Desafio público</Label>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !title.trim() || !targetValue}>
              {loading ? "Criando..." : "Criar Desafio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;
