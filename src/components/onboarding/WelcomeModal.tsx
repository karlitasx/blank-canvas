import { Sparkles, Heart, BookOpen, Handshake, MessageCircle, Map, Compass } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface WelcomeModalProps {
  open: boolean;
  onStartTour: () => void;
  onExplore: () => void;
}

const WelcomeModal = ({ open, onStartTour, onExplore }: WelcomeModalProps) => {
  const { displayName } = useProfile();
  const navigate = useNavigate();

  const handleIntroduce = () => {
    onExplore();
    navigate("/comunidade");
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden max-h-[90vh] overflow-y-auto">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Hero gradient area */}
          <div className="bg-gradient-to-br from-primary via-primary/80 to-accent p-8 pb-10 text-center relative">
            <div className="absolute top-4 right-6 w-12 h-12 rounded-full border-2 border-primary-foreground/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground/60" />
            </div>
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-4 backdrop-blur-sm">
              Bem-vinda ao Vertice
            </span>
            
            <h2 className="text-2xl font-extrabold text-primary-foreground mb-2">
              Oie, que incrível ter você aqui! ✨ <Heart className="inline w-5 h-5 text-red-400 fill-red-400" />
            </h2>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md mx-auto">
              Esse espaço foi criado para mulheres como nós — que querem aprender, crescer e se organizar financeiramente sem aquela linguagem chata e complicada. Aqui a gente fala de dinheiro, carreira, hábitos e vida real. E você nunca mais vai se sentir sozinha ou perdida nessa jornada.
            </p>
          </div>

          {/* Steps area */}
          <div className="bg-card p-6 -mt-4 rounded-t-2xl relative space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Como funciona a comunidade?
                </h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  Conteúdos diários, materiais exclusivos, aulas, clube do livro, lives semanais e muito papo sobre finanças, carreira e produtividade!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                  <Handshake className="w-5 h-5 text-primary" />
                  Apresente-se para os outros membros!
                </h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  Conte quem é você, o que faz, o que ama e seus objetivos financeiros.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleIntroduce}
                >
                  Apresente-se aqui!
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Faça o tour guiado!
                </h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  Conheça todas as funcionalidades: hábitos, finanças, autocuidado, conquistas e muito mais.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-3">
              <Button 
                onClick={onStartTour}
                className="w-full py-5 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-md"
              >
                <Map className="w-5 h-5 mr-2" />
                Fazer tour guiado
              </Button>
              
              <Button 
                onClick={onExplore}
                variant="outline"
                className="w-full py-5 text-base font-medium"
              >
                <Compass className="w-5 h-5 mr-2" />
                Explorar por conta própria
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
