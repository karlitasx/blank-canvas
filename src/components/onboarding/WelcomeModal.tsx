import { Sparkles, Map, Compass } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

interface WelcomeModalProps {
  open: boolean;
  onStartTour: () => void;
  onExplore: () => void;
}

const WelcomeModal = ({ open, onStartTour, onExplore }: WelcomeModalProps) => {
  const { displayName } = useProfile();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Hero gradient area */}
          <div className="bg-gradient-to-br from-primary via-primary/80 to-accent p-8 pb-10 text-center relative">
            {/* Decorative circles */}
            <div className="absolute top-4 right-6 w-12 h-12 rounded-full border-2 border-primary-foreground/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground/60" />
            </div>
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-4 backdrop-blur-sm">
              Bem-vinda ao
            </span>
            
            <h2 className="text-3xl font-extrabold text-primary-foreground mb-2">
              VidaFlow
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Sua plataforma completa de hábitos, finanças e autocuidado
            </p>
          </div>

          {/* Content area */}
          <div className="bg-card p-6 space-y-3 -mt-4 rounded-t-2xl relative">
            <div className="text-center mb-4">
              <p className="text-lg">
                Olá <span className="text-primary font-bold">{displayName}</span>! 
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Conheça tudo que preparamos para você.
              </p>
            </div>

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
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
