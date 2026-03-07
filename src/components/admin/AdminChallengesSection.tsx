import { useState } from "react";
import { Plus, Users, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  start_date: string;
  end_date: string;
  target_value: number;
  is_public: boolean;
  participants_count?: number;
}

interface AdminChallengesSectionProps {
  challenges: Challenge[];
  onCreate: (challenge: {
    title: string;
    description?: string;
    emoji: string;
    start_date: string;
    end_date: string;
    target_value: number;
    is_public: boolean;
  }) => Promise<boolean>;
  onToggleVisibility: (id: string, isPublic: boolean) => void;
}

const AdminChallengesSection = ({
  challenges,
  onCreate,
  onToggleVisibility,
}: AdminChallengesSectionProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    emoji: "🏆",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    target_value: 7,
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.end_date) return;

    setLoading(true);
    const success = await onCreate({
      ...form,
      description: form.description || undefined,
    });
    setLoading(false);

    if (success) {
      setOpen(false);
      setForm({
        title: "",
        description: "",
        emoji: "🏆",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        target_value: 7,
        is_public: true,
      });
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Gestão de Desafios</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Novo Desafio
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Criar Novo Desafio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="text-center text-xl"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-3">
                  <Label>Nome *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: 7 dias de exercício"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalhes do desafio..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data Início *</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Data Fim *</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Meta (dias/ações)</Label>
                  <Input
                    type="number"
                    value={form.target_value}
                    onChange={(e) => setForm({ ...form, target_value: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={form.is_public}
                    onCheckedChange={(checked) => setForm({ ...form, is_public: checked })}
                  />
                  <Label>Público</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Criando..." : "Criar Desafio"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {challenges.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum desafio criado
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-3 rounded-lg border ${
                isExpired(challenge.end_date)
                  ? "bg-muted/30 border-muted"
                  : challenge.is_public
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{challenge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{challenge.title}</span>
                    {isExpired(challenge.end_date) && (
                      <Badge variant="secondary" className="text-xs">
                        Expirado
                      </Badge>
                    )}
                    {!challenge.is_public && (
                      <Badge variant="outline" className="text-xs">
                        Oculto
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(challenge.start_date), "dd/MM", { locale: ptBR })} -{" "}
                      {format(new Date(challenge.end_date), "dd/MM", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {challenge.participants_count || 0}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisibility(challenge.id, !challenge.is_public)}
                  title={challenge.is_public ? "Desativar" : "Ativar"}
                >
                  {challenge.is_public ? (
                    <ToggleRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AdminChallengesSection;
