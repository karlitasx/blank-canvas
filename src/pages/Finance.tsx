import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2 } from "lucide-react";

const Finance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outros");
  const [type, setType] = useState("expense");

  const fetchData = async () => {
    if (!user) return;
    const [transRes, goalsRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: false }).limit(50),
      supabase.from("finance_goals").select("*").eq("user_id", user.id),
    ]);
    setTransactions(transRes.data || []);
    setGoals(goalsRes.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const createTransaction = async () => {
    if (!user || !amount) return;
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id, amount: Number(amount), description, category, type,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Transação adicionada!");
    setAmount(""); setDescription(""); setOpen(false);
    fetchData();
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finanças</h1>
          <p className="text-muted-foreground">Controle suas receitas e despesas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Transação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Transação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant={type === "expense" ? "default" : "outline"} onClick={() => setType("expense")} className="flex-1">Despesa</Button>
                <Button variant={type === "income" ? "default" : "outline"} onClick={() => setType("income")} className="flex-1">Receita</Button>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Almoço" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Alimentação" />
              </div>
              <Button onClick={createTransaction} className="w-full">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">R$ {totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-500"}`}>R$ {balance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-3">
          {transactions.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{t.description || t.category}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.transaction_date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}R$ {Number(t.amount).toFixed(2)}
                  </span>
                  <button onClick={() => deleteTransaction(t.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhuma transação registrada</p>}
        </TabsContent>
        <TabsContent value="goals" className="space-y-3">
          {goals.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{g.emoji} {g.title}</span>
                  <Badge variant="outline">{g.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  R$ {Number(g.current_amount).toFixed(2)} / R$ {Number(g.target_amount).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
          {goals.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhuma meta financeira</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
