import { useState } from "react";
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ResetProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetProfileModal = ({ isOpen, onClose }: ResetProfileModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const isConfirmValid = confirmText === "RESETAR";

  const handleClose = () => {
    setStep(1);
    setConfirmText("");
    setShowSuccess(false);
    onClose();
  };

  const handleReset = async () => {
    if (!isConfirmValid) return;
    setIsResetting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("reset-profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data?.success) {
        setShowSuccess(true);
        // Clear local storage preferences
        localStorage.removeItem("vidaflow_preferences");
        localStorage.removeItem("hasSeenOnboardingTour");
        localStorage.removeItem("hasSeenWelcome");

        setTimeout(() => {
          handleClose();
          navigate("/primeiros-passos");
        }, 2500);
      } else {
        throw new Error(data?.error || "Erro ao resetar perfil");
      }
    } catch (err: any) {
      console.error("Reset error:", err);
      toast.error("Erro ao resetar perfil. Tente novamente.");
    } finally {
      setIsResetting(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <span className="text-4xl">🌱</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Perfil resetado!</h3>
            <p className="text-muted-foreground text-sm">
              Que começo novo incrível te espera! Redirecionando...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 1 ? (
          <div className="animate-fade-in">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Atenção!
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <p className="text-sm text-foreground font-medium">
                Ao resetar seu perfil, você perderá <strong>permanentemente</strong>:
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Todo o seu progresso e histórico",
                  "Suas conquistas desbloqueadas",
                  "Objetivos cadastrados",
                  "Rotinas e planejamentos",
                  "Fotos e informações pessoais",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-semibold">
                  ⚠️ Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirmação final</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Para confirmar, digite <strong className="text-foreground">RESETAR</strong> no campo abaixo:
              </p>

              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Digite RESETAR"
                className={cn(
                  "text-center text-lg font-semibold tracking-widest",
                  isConfirmValid && "border-destructive ring-1 ring-destructive"
                )}
                autoFocus
              />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={isResetting}>
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  disabled={!isConfirmValid || isResetting}
                  onClick={handleReset}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Resetar meu perfil
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetProfileModal;
