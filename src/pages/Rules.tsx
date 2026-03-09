import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Heart, Shield, Ban, Users, MessageCircle, Share2, HelpCircle,
  Rss, Wallet, Calendar, Diamond, Target, HeartPulse, Dumbbell, Trophy,
} from "lucide-react";

const rules = [
  {
    icon: Heart,
    title: "Respeito acima de tudo",
    description:
      "Trate todos com gentileza. Não toleramos bullying, ofensas, discriminação ou qualquer tipo de desrespeito.",
  },
  {
    icon: Shield,
    title: "Privacidade importa",
    description:
      "Não compartilhe dados pessoais de outros membros sem consentimento. Respeite a privacidade de todos.",
  },
  {
    icon: Ban,
    title: "Sem spam ou autopromoção",
    description:
      "Evite publicar links de vendas, spam, correntes ou qualquer tipo de propaganda não autorizada.",
  },
  {
    icon: Users,
    title: "Contribua positivamente",
    description:
      "Compartilhe experiências, dúvidas e conquistas. A comunidade cresce quando todos participam com qualidade.",
  },
  {
    icon: MessageCircle,
    title: "Comunicação saudável",
    description:
      "Discorde com respeito. Críticas construtivas são bem-vindas, mas ataques pessoais não.",
  },
  {
    icon: Share2,
    title: "Compartilhamento responsável",
    description:
      "Ao compartilhar conteúdo de terceiros, dê os devidos créditos. Partilhe com ética e responsabilidade, sempre valorizando o trabalho de outros criadores.",
  },
];

const faqs = [
  {
    question: "O que acontece se eu violar uma regra?",
    answer:
      "O descumprimento das regras pode resultar em advertência, suspensão temporária ou exclusão permanente da comunidade, dependendo da gravidade da violação. Nossa equipe de moderação avalia cada caso individualmente.",
  },
  {
    question: "Como denunciar um conteúdo inadequado na comunidade?",
    answer:
      "Você pode denunciar qualquer conteúdo inadequado utilizando o botão de denúncia disponível em cada publicação, ou entrando em contato diretamente com a equipe de moderação pelo chat.",
  },
  {
    question: "O que fazer se um evento sumir da plataforma?",
    answer:
      "Eventos podem ser removidos ou reagendados pela equipe organizadora. Verifique a aba de Eventos para atualizações ou entre em contato com o suporte para mais informações.",
  },
  {
    question: "Posso compartilhar conteúdo da comunidade externamente?",
    answer:
      "Conteúdos exclusivos da comunidade não devem ser compartilhados externamente sem autorização. Respeite a privacidade dos membros e a propriedade intelectual dos criadores.",
  },
];

const features = [
  {
    icon: Rss,
    title: "Feed de publicações",
    description: "Compartilhe ideias, experiências e dicas financeiras com outras mulheres.",
    link: "/social",
    linkText: "Ver publicações >",
  },
  {
    icon: Users,
    title: "Grupos",
    description: "Encontre grupos com interesses específicos: investimentos, controle de gastos, empreendedorismo.",
    link: "/social?tab=groups",
    linkText: "Ver grupos >",
  },
  {
    icon: Calendar,
    title: "Eventos",
    description: "Workshops, palestras e encontros semanais para você evoluir junto com a comunidade.",
    link: "/calendar",
    linkText: "Ver eventos >",
  },
  {
    icon: Wallet,
    title: "Minhas Finanças",
    description: "Controle simples e prático da sua vida financeira pessoal e empresarial.",
    link: "/finance",
    linkText: "Ver finanças >",
  },
  {
    icon: Target,
    title: "Rotina & Hábitos",
    description: "Planeje sua rotina semanal e acompanhe seus hábitos diários com consistência.",
    link: "/routine",
    linkText: "Ver rotina >",
  },
  {
    icon: HeartPulse,
    title: "Autocuidado",
    description: "Check-ins emocionais, micro rituais e equilíbrio dos pilares da sua vida.",
    link: "/selfcare",
    linkText: "Ver autocuidado >",
  },
  {
    icon: Dumbbell,
    title: "GymRats",
    description: "Desafios fitness com check-in por foto. Mantenha a consistência e inspire outras.",
    link: "/gymrats",
    linkText: "Ver GymRats >",
  },
  {
    icon: Trophy,
    title: "Ranking & Conquistas",
    description: "Ganhe pontos, suba de nível e desbloqueie conquistas conforme evolui na plataforma.",
    link: "/ranking",
    linkText: "Ver ranking >",
  },
];

const Rules = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout activeNav="/regras">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Diretrizes da Comunidade
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">
            Regras da Comunidade
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Para que todas se sintam acolhidas e seguras, siga nossas diretrizes.
          </p>
        </div>

        {/* Rules Cards */}
        <div className="space-y-4">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <Card key={idx} className="border-border">
                <CardContent className="p-5 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base mb-1">{rule.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{rule.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Callout */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-extrabold text-foreground mb-3">Contamos com você!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-5">
              Lembrando que o descumprimento dessas regras pode resultar na exclusão do conteúdo ou, em casos mais sérios, na exclusão do membro dentro da comunidade. Aqui, queremos todos se sentindo bem-vindos(as) e respeitados(as)!
            </p>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8 py-5 text-base">
              <Heart className="w-5 h-5 mr-2" />
              Juntas somos mais fortes
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground">Perguntas Frequentes</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border border-border rounded-xl px-4 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed border-l-2 border-primary pl-4 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Descubra tudo que oferecemos */}
        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-5">Descubra tudo que oferecemos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(feature.link)}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                    <span className="text-primary font-semibold text-sm">{feature.linkText}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="pb-8" />
      </div>
    </DashboardLayout>
  );
};

export default Rules;
