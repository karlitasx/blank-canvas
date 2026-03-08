import { Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FirstStepsCardProps {
  onStart: () => void;
}

const FirstStepsCard = ({ onStart }: FirstStepsCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-primary/20">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              Primeiros Passos
              <span className="text-sm font-normal text-muted-foreground">(comece aqui)</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Novo por aqui? Faça um tour rápido e descubra todas as funcionalidades!
            </p>
            <Button onClick={onStart} className="w-full sm:w-auto">
              <Rocket className="w-4 h-4 mr-2" />
              Iniciar Tour Guiado
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirstStepsCard;
