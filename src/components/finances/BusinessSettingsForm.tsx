import { useState } from "react";
import { Building2, Store, Briefcase, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusinessSettings, type BusinessType } from "@/hooks/useBusinessSettings";
import { toast } from "sonner";

interface BusinessSettingsFormProps {
  onComplete?: () => void;
}

const businessTypes = [
  { value: "mei" as BusinessType, label: "MEI", description: "Microempreendedor Individual", icon: Store, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: "simples" as BusinessType, label: "Simples Nacional", description: "Empresas do Simples Nacional", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "autonomo" as BusinessType, label: "Autônomo / Freelancer", description: "Profissional autônomo ou freelancer", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const BusinessSettingsForm = ({ onComplete }: BusinessSettingsFormProps) => {
  const { settings, saveSettings } = useBusinessSettings();
  const [selectedType, setSelectedType] = useState<BusinessType>(settings?.business_type || "mei");
  const [cnpj, setCnpj] = useState(settings?.cnpj || "");
  const [companyName, setCompanyName] = useState(settings?.company_name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveSettings(selectedType, cnpj, companyName);
    toast.success("Configurações salvas!");
    setSaving(false);
    onComplete?.();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Settings className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Configuração Empresarial</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione o tipo do seu negócio</p>
      </div>

      <div className="space-y-3">
        {businessTypes.map((bt) => {
          const Icon = bt.icon;
          const isSelected = selectedType === bt.value;
          return (
            <button
              key={bt.value}
              onClick={() => setSelectedType(bt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${bt.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${bt.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{bt.label}</p>
                <p className="text-sm text-muted-foreground">{bt.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary" : "border-muted-foreground/40"}`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <Label>Nome da empresa (opcional)</Label>
          <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Minha Empresa Ltda" className="mt-1.5" />
        </div>
        {selectedType !== "autonomo" && (
          <div>
            <Label>CNPJ (opcional)</Label>
            <Input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" className="mt-1.5" />
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full btn-gradient py-5 text-sm font-semibold rounded-xl">
        {saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default BusinessSettingsForm;
