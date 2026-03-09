import { Shield, X, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const LgpdNotice = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        aria-label="Segurança e Privacidade"
        title="Segurança e Privacidade (LGPD)"
      >
        <Shield className="w-5 h-5 text-primary" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Segurança e Privacidade (LGPD)
          </DialogTitle>

          <div className="space-y-5 text-sm text-muted-foreground leading-relaxed mt-2">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                🔒 Nota de Segurança e Privacidade (LGPD):
              </h3>
              <p>
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018), informamos que:
              </p>
              <ul className="mt-3 space-y-2">
                <li>• A Veve utiliza inteligência artificial avançada para auxiliar nas suas finanças.</li>
                <li>• A inteligência artificial não possui acesso a dados financeiros pessoais.</li>
                <li>• O Vertice não acessa, coleta dados financeiros sensíveis das usuárias.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                🔐 Tratamento e proteção dos dados:
              </h3>
              <p>
                Os dados eventualmente tratados pela plataforma seguem os princípios da finalidade, necessidade e segurança, conforme estabelecido pela LGPD.
              </p>
              <p className="mt-3">
                Nosso banco de dados está hospedado em infraestrutura segura, reconhecida internacionalmente por seus altos padrões de segurança, que conta com:
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✔️</span> Criptografia de dados
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✔️</span> Controle de acesso restrito
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✔️</span> Infraestrutura segura e confiável
                </li>
              </ul>
            </div>

            <p className="text-center text-muted-foreground italic border-t border-border pt-4">
              Todo o ambiente foi estruturado para garantir a privacidade, integridade e proteção dos dados pessoais, permitindo o uso da Veve e das finanças com tranquilidade, segurança e confiança 💜✨
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LgpdNotice;
