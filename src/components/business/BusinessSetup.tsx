import { useState } from "react";
import { Building2, FileText, User, ChevronRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessType } from "@/hooks/useBusinessFinance";

interface Props {
  onSave: (type: BusinessType, companyName?: string, cnpj?: string) => Promise<void>;
}

const options: { type: BusinessType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: "mei", label: "MEI", desc: "Microempreendedor Individual — faturamento até R$ 81.000/ano", icon: FileText },
  { type: "simples_nacional", label: "Simples Nacional", desc: "Empresas com faturamento até R$ 4,8 milhões/ano", icon: Building2 },
  { type: "autonomo", label: "Autônomo / Freelancer", desc: "Profissional liberal sem CNPJ formal", icon: User },
];

const BusinessSetup = ({ onSave }: Props) => {
  const [selected, setSelected] = useState<BusinessType | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await onSave(selected, companyName || undefined, cnpj || undefined);
    setSaving(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary via-secondary to-accent p-8 md:p-10 text-center">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-5 shadow-lg">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-2">
            Finanças Empresariais
          </h1>
          <p className="text-primary-foreground/75 text-sm md:text-base max-w-md mx-auto">
            Configure seu tipo de empresa para começar
          </p>
        </div>
      </div>

      {/* Type selection */}
      <div className="space-y-3 mb-6">
        {options.map(opt => {
          const Icon = opt.icon;
          const isSelected = selected === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setSelected(opt.type)}
              className={`w-full group glass-card p-5 flex items-center gap-4 transition-all duration-300 text-left border-2 ${
                isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/30"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? "bg-primary/20" : "bg-muted"
              }`}>
                <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{opt.label}</h3>
                <p className="text-sm text-muted-foreground">{opt.desc}</p>
              </div>
              <ChevronRight className={`w-5 h-5 shrink-0 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
            </button>
          );
        })}
      </div>

      {/* Optional fields */}
      {selected && selected !== "autonomo" && (
        <div className="glass-card p-5 space-y-4 mb-6 animate-fade-in">
          <h3 className="font-semibold text-foreground">Dados opcionais</h3>
          <Input
            placeholder="Nome da empresa"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
          <Input
            placeholder="CNPJ (opcional)"
            value={cnpj}
            onChange={e => setCnpj(e.target.value)}
          />
        </div>
      )}

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={!selected || saving}
        className="w-full btn-gradient py-5 text-base font-semibold rounded-xl"
      >
        {saving ? "Salvando..." : "Começar"}
      </Button>
    </div>
  );
};

export default BusinessSetup;
