import { User, Building2, Wallet, ChevronRight, DollarSign } from "lucide-react";

export type FinanceType = "personal" | "business";

interface FinanceTypeSelectorProps {
  onSelect: (type: FinanceType) => void;
}

const FinanceTypeSelector = ({ onSelect }: FinanceTypeSelectorProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary via-secondary to-accent p-8 md:p-10 text-center">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-5 shadow-lg">
            <DollarSign className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-2">
            Gestão Financeira
          </h1>
          <p className="text-primary-foreground/75 text-sm md:text-base max-w-md mx-auto">
            Escolha o tipo de controle financeiro para começar
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <button
          onClick={() => onSelect("personal")}
          className="w-full group glass-card p-6 flex items-center gap-5 hover:border-primary/40 transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center shrink-0 group-hover:bg-secondary/25 transition-colors">
            <User className="w-7 h-7 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground">Finanças Pessoais</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Controle seus gastos pessoais, receitas e metas financeiras individuais
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>

        <button
          onClick={() => onSelect("business")}
          className="w-full group glass-card p-6 flex items-center gap-5 hover:border-primary/40 transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
            <Building2 className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground">Finanças Empresariais</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as finanças do seu negócio, CNPJ, fluxo de caixa e despesas
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default FinanceTypeSelector;
