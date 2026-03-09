import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Rocket, Heart, Users, Wallet, Target, BarChart3, Dumbbell,
  Mail, CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const newsItems = [
  {
    icon: Users,
    status: "Em Desenvolvimento",
    statusColor: "bg-yellow-100 text-yellow-700",
    title: "Grupos e cursos",
    description:
      "Conecte-se com outras mulheres que compartilham seus interesses. Teremos grupos focados em investimentos, empreendedorismo, finanças, desenvolvimento pessoal e muito mais.",
  },
  {
    icon: BarChart3,
    status: "Em Desenvolvimento",
    statusColor: "bg-yellow-100 text-yellow-700",
    title: "Relatórios inteligentes",
    description:
      "Relatórios detalhados sobre seus gastos e receitas com gráficos interativos e insights da Veve para otimizar suas finanças.",
  },
  {
    icon: Target,
    status: "Em Desenvolvimento",
    statusColor: "bg-yellow-100 text-yellow-700",
    title: "Desafios personalizados",
    description:
      "Desafios criados especialmente para você com base nos seus objetivos financeiros e hábitos.",
  },
];

const launchedItems = [
  {
    icon: Wallet,
    status: "Lançado",
    statusColor: "bg-emerald-100 text-emerald-700",
    title: "Controle financeiro completo",
    description:
      "Gerencie suas receitas, despesas e investimentos pessoais e empresariais com facilidade.",
  },
  {
    icon: Dumbbell,
    status: "Lançado",
    statusColor: "bg-emerald-100 text-emerald-700",
    title: "GymRats",
    description:
      "Desafios fitness com check-in por foto. Mantenha a consistência e inspire outras mulheres na comunidade.",
  },
  {
    icon: Rocket,
    status: "Lançado",
    statusColor: "bg-emerald-100 text-emerald-700",
    title: "Assistente Veve",
    description:
      "Sua assistente financeira pessoal com inteligência artificial para tirar dúvidas e dar orientações.",
  },
];

const Novidades = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!email.trim()) return;
    toast({
      title: "Inscrita com sucesso! 🎉",
      description: "Você será notificada sobre as novidades.",
    });
    setEmail("");
  };

  const renderItems = (items: typeof newsItems) =>
    items.map((item, idx) => {
      const Icon = item.icon;
      return (
        <Card key={idx} className="border-border">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${item.statusColor}`}>
                  {item.status}
                </span>
                <h3 className="font-bold text-foreground text-base mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
            <div className="mt-3 pl-16">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      );
    });

  return (
    <DashboardLayout activeNav="/novidades">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-accent/80 via-primary/40 to-primary/20 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Novidades</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            Estamos sempre trabalhando para trazer novas ferramentas e recursos que vão impulsionar sua jornada financeira. Confira o que está por vir e o que já lançamos!
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted">
            <TabsTrigger value="news" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Rocket className="w-4 h-4" />
              Novidades
            </TabsTrigger>
            <TabsTrigger value="launched" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Lançamos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4 mt-4">
            {renderItems(newsItems)}
          </TabsContent>

          <TabsContent value="launched" className="space-y-4 mt-4">
            {renderItems(launchedItems)}
          </TabsContent>
        </Tabs>

        {/* Newsletter */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-2">Quer ser a primeira a saber?</h2>
            <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
              Inscreva-se em nossa lista de novidades e avisaremos você assim que esses recursos incríveis estiverem disponíveis!
            </p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor email"
                type="email"
                className="text-center"
              />
              <Button
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-5 text-base font-semibold"
              >
                Quero ser notificada!
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="pb-8" />
      </div>
    </DashboardLayout>
  );
};

export default Novidades;
