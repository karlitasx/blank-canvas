import { User, Building2, Wallet, ChevronRight } from "lucide-react";

export type FinanceType = "personal" | "business";

interface FinanceTypeSelectorProps {
  onSelect: (type: FinanceType) => void;
}

const FinanceTypeSelector = ({ onSelect }: FinanceTypeSelectorProps) => {
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Gestão Financeira</h2>
        <p className="text-muted-foreground text-sm">
          Escolha o tipo de controle financeiro
        </p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <button
          onClick={() => onSelect("personal")}
          className="w-full group glass-card p-5 flex items-center gap-4 hover:border-primary/40 transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 group-hover:bg-blue-500/25 transition-colors">
            <User className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">Finanças Pessoais</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Controle seus gastos pessoais, receitas e metas financeiras individuais
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>

        <button
          onClick={() => onSelect("business")}
          className="w-full group glass-card p-5 flex items-center gap-4 hover:border-primary/40 transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/25 transition-colors">
            <Building2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">Finanças Empresariais</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
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
