import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, Smile, Frown, Meh, Zap, Sun, Moon } from "lucide-react";

const MOODS = [
  { value: "great", label: "Ótimo", icon: "😊" },
  { value: "good", label: "Bem", icon: "🙂" },
  { value: "neutral", label: "Neutro", icon: "😐" },
  { value: "bad", label: "Mal", icon: "😔" },
  { value: "terrible", label: "Péssimo", icon: "😢" },
];

const PILLARS = ["Corpo", "Mente", "Emoções", "Relações", "Propósito"];

const SelfCare = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [pillarActions, setPillarActions] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    if (!user) return;
    const [checkinsRes, pillarRes] = await Promise.all([
      supabase.from("selfcare_checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: false }).limit(30),
      supabase.from("selfcare_pillar_actions").select("*").eq("user_id", user.id).eq("action_date", today),
    ]);
    const all = checkinsRes.data || [];
    setCheckins(all);
    setTodayCheckin(all.find((c) => c.checkin_date === today) || null);
    setPillarActions(pillarRes.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const saveCheckin = async () => {
    if (!user || !selectedMood) return;
    if (todayCheckin) {
      await supabase.from("selfcare_checkins").update({ emotional_state: selectedMood, note, energy_level: energyLevel }).eq("id", todayCheckin.id);
    } else {
      await supabase.from("selfcare_checkins").insert({ user_id: user.id, emotional_state: selectedMood, note, energy_level: energyLevel, checkin_date: today });
    }
    toast.success("Check-in salvo!");
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Autocuidado</h1>
        <p className="text-muted-foreground">Como você está hoje?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" /> Check-in de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Como você está se sentindo?</Label>
            <div className="flex gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${selectedMood === mood.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  <span className="text-2xl">{mood.icon}</span>
                  <span className="text-xs">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nível de energia: {energyLevel}/10</Label>
            <input type="range" min="1" max="10" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} className="w-full" />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Como foi seu dia?" />
          </div>

          <Button onClick={saveCheckin} disabled={!selectedMood}>
            {todayCheckin ? "Atualizar" : "Salvar"} Check-in
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pilares do Autocuidado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {PILLARS.map((pillar) => {
              const done = pillarActions.some((a) => a.pillar === pillar);
              return (
                <div key={pillar} className={`p-4 rounded-lg border text-center transition-colors ${done ? "border-primary bg-primary/5" : "border-border"}`}>
                  <p className="font-medium text-sm">{pillar}</p>
                  <Badge variant={done ? "default" : "outline"} className="mt-2 text-xs">
                    {done ? "✓ Feito" : "Pendente"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checkins.slice(0, 7).map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm">{c.checkin_date}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{MOODS.find((m) => m.value === c.emotional_state)?.icon || "😐"}</span>
                <Badge variant="outline" className="text-xs">Energia: {c.energy_level}/10</Badge>
              </div>
            </div>
          ))}
          {checkins.length === 0 && <p className="text-muted-foreground text-sm">Nenhum check-in registrado</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfCare;
