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
        <div className="bg-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Header gradient */}
          <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-primary" />
          
          {/* Content */}
          <div className="p-8 text-center">
            {/* Logo/Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>

            {/* Welcome title */}
            <h2 className="text-2xl font-bold mb-4">
              Seja bem-vinda ao VidaFlow!
            </h2>

            {/* User greeting */}
            <p className="text-lg mb-2">
              Olá <span className="text-primary font-semibold">{displayName}</span>!
            </p>

            {/* Description */}
            <p className="text-muted-foreground mb-2">
              Estamos muito felizes em ter você conosco na nossa comunidade!
            </p>
            <p className="text-muted-foreground mb-8">
              Aqui você pode acompanhar seus hábitos, finanças, autocuidado e muito mais.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onStartTour}
                className="w-full py-6 text-base font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-primary hover:opacity-90 transition-opacity border-2 border-pink-400/50 shadow-lg"
              >
                <Map className="w-5 h-5 mr-2" />
                Fazer tour guiado
              </Button>
              
              <Button 
                onClick={onExplore}
                variant="outline"
                className="w-full py-6 text-base font-medium"
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
