import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Handshake, MessageCircle, BookMarked, Compass, Map,
  Rss, Calendar, Users, Wallet,
} from "lucide-react";

const WHATSAPP_LINK = "https://chat.whatsapp.com/PLACEHOLDER";

const FirstSteps = () => {
  const navigate = useNavigate();

  const handleStartTour = () => {
    navigate("/?tour=welcome");
  };

  return (
    <DashboardLayout activeNav="/primeiros-passos">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl p-8 text-center mb-8">
        <h1 className="text-2xl font-extrabold text-primary-foreground mb-2">
          Oie, que incrível ter você aqui! ✨
        </h1>
        <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-lg mx-auto">
          Esse espaço foi criado para mulheres como nós — que querem aprender, crescer e se organizar financeiramente. Aqui a gente fala de dinheiro, carreira, hábitos e vida real.
        </p>
      </div>

      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Step 1 */}
        <StepItem number={1} icon={BookOpen} title="Como funciona a comunidade?">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Conteúdos diários, materiais exclusivos, aulas, clube do livro, lives semanais e muito papo sobre finanças, carreira e produtividade!
          </p>
        </StepItem>

        <Separator />

        {/* Step 2 */}
        <StepItem number={2} icon={Handshake} title="Apresente-se para os outros membros!">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Conte quem é você, o que faz, o que ama e seus objetivos financeiros.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate("/social?tab=introductions")}
          >
            Apresente-se aqui!
          </Button>
        </StepItem>

        <Separator />

        {/* Step 3 */}
        <StepItem number={3} icon={MessageCircle} title="Entre no nosso grupo do WhatsApp">
          <p className="text-muted-foreground text-sm leading-relaxed">
            👉 Clique aqui para acessar pelo celular
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold text-sm hover:underline mt-2 inline-block"
          >
            Entrar no grupo
          </a>
        </StepItem>

        <Separator />

        {/* Step 4 */}
        <StepItem number={4} icon={BookMarked} title="Conheça nossas diretrizes">
          <p className="text-muted-foreground text-sm leading-relaxed">
            👉 Leia nossas regras antes de começar
          </p>
          <button
            onClick={() => navigate("/social?tab=rules")}
            className="text-primary font-semibold text-sm hover:underline mt-2 inline-block"
          >
            Leia nossas regras antes de começar
          </button>
        </StepItem>

        <Separator />

        {/* Step 5 */}
        <StepItem number={5} icon={Compass} title="Comece a explorar a comunidade">
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            👉 Conheça as principais áreas da plataforma
          </p>
          <ul className="space-y-3">
            <ExploreLink icon={Rss} label="Feed Principal:" desc="conteúdos diários, novidades e interações." onClick={() => navigate("/social")} linkText="Ir para o feed" />
            <ExploreLink icon={Calendar} label="Eventos:" desc="workshops, palestras e encontros semanais." onClick={() => navigate("/calendar")} linkText="Ver eventos" />
            <ExploreLink icon={Users} label="Grupos Temáticos:" desc="rodas de conversa sobre temas específicos." onClick={() => navigate("/social?tab=groups")} linkText="Ver grupos" />
            <ExploreLink icon={Wallet} label="Minhas Finanças:" desc="controle simples da sua vida financeira." onClick={() => navigate("/finance")} linkText="Ver finanças" />
          </ul>
        </StepItem>

        <Separator />

        {/* Step 6 */}
        <StepItem number={6} icon={Map} title="Tour Exclusivo da Comunidade">
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            Faça o tour guiado e conheça todas as funcionalidades: hábitos, finanças, autocuidado, conquistas e mais.
          </p>
          <Button onClick={handleStartTour} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Map className="w-4 h-4 mr-2" />
            Fazer tour guiado
          </Button>
        </StepItem>

        <div className="pb-8" />
      </div>
    </DashboardLayout>
  );
};

/* ── Sub-components ── */

function StepItem({ number, icon: Icon, title, children }: {
  number: number;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-base mb-1">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function ExploreLink({ icon: Icon, label, desc, onClick, linkText }: {
  icon: React.ElementType;
  label: string;
  desc: string;
  onClick: () => void;
  linkText: string;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <span className="text-foreground">
        <strong>{label}</strong> {desc}{" "}
        <button onClick={onClick} className="text-primary font-semibold hover:underline">
          {linkText}
        </button>
      </span>
    </li>
  );
}

export default FirstSteps;
