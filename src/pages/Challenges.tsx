import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trophy, Users } from "lucide-react";

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("30");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const [challRes, partRes] = await Promise.all([
      supabase.from("challenges").select("*").order("created_at", { ascending: false }),
      supabase.from("challenge_participants").select("*").eq("user_id", user.id),
    ]);
    setChallenges(challRes.data || []);
    setParticipations(partRes.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const createChallenge = async () => {
    if (!user || !title || !endDate) return;
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("challenges").insert({
      created_by: user.id, title, description, target_value: Number(targetValue), start_date: today, end_date: endDate,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Desafio criado!");
    setTitle(""); setDescription(""); setOpen(false);
    fetchData();
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    const { error } = await supabase.from("challenge_participants").insert({ user_id: user.id, challenge_id: challengeId });
    if (error) { toast.error(error.message); return; }
    toast.success("Você entrou no desafio!");
    fetchData();
  };

  const isParticipating = (id: string) => participations.some((p) => p.challenge_id === id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Desafios</h1>
          <p className="text-muted-foreground">Participe e crie desafios</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Desafio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Desafio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: 30 dias de meditação" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o desafio" />
              </div>
              <div className="space-y-2">
                <Label>Meta (dias/vezes)</Label>
                <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data final</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={createChallenge} className="w-full">Criar Desafio</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {challenges.map((ch) => {
          const participation = participations.find((p) => p.challenge_id === ch.id);
          const progress = participation ? (participation.current_progress / ch.target_value) * 100 : 0;
          return (
            <Card key={ch.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ch.emoji} {ch.title}</CardTitle>
                  <Badge variant="outline">{ch.challenge_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {ch.description && <p className="text-sm text-muted-foreground">{ch.description}</p>}
                <div className="text-xs text-muted-foreground">
                  {ch.start_date} → {ch.end_date} · Meta: {ch.target_value}
                </div>
                {participation && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{participation.current_progress}/{ch.target_value}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                {!isParticipating(ch.id) && (
                  <Button variant="outline" size="sm" onClick={() => joinChallenge(ch.id)}>
                    <Users className="h-4 w-4 mr-2" /> Participar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && <p className="text-center py-12 text-muted-foreground">Nenhum desafio disponível. Crie o primeiro!</p>}
    </div>
  );
};

export default Challenges;
