import { forwardRef } from "react";
import { User, Building2, ChevronRight, DollarSign } from "lucide-react";

export type FinanceType = "personal" | "business";

interface FinanceTypeSelectorProps {
  onSelect: (type: FinanceType) => void;
}

const FinanceTypeSelector = forwardRef<HTMLDivElement, FinanceTypeSelectorProps>(
  ({ onSelect }, ref) => {
    return (
      <div ref={ref} className="w-full max-w-2xl mx-auto animate-fade-in px-1">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 md:mb-8 bg-gradient-to-br from-primary via-secondary to-accent p-6 md:p-10 text-center">
          <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-4 md:mb-5 shadow-lg">
              <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-primary-foreground mb-2">
              Gestão Financeira
            </h1>
            <p className="text-primary-foreground/75 text-sm md:text-base max-w-md mx-auto">
              Escolha o tipo de controle financeiro
            </p>
          </div>
        </div>

        {/* Options - Cards */}
        <div className="space-y-3 md:space-y-4">
          <button
            onClick={() => onSelect("personal")}
            className="w-full group glass-card p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-primary/40 transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-secondary/15 flex items-center justify-center shrink-0 group-hover:bg-secondary/25 transition-colors">
              <User className="w-6 h-6 md:w-7 md:h-7 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg text-foreground">Finanças Pessoais</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">
                Controle gastos, receitas e metas individuais
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </button>

          <button
            onClick={() => onSelect("business")}
            className="w-full group glass-card p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-primary/40 transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
              <Building2 className="w-6 h-6 md:w-7 md:h-7 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg text-foreground">Finanças Empresariais</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">
                Gerencie seu negócio, MEI ou Simples Nacional
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </button>
        </div>
      </div>
    );
  }
);

FinanceTypeSelector.displayName = "FinanceTypeSelector";

export default FinanceTypeSelector;
