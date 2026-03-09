import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessFinance, BusinessType } from "@/hooks/useBusinessFinance";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  biz: ReturnType<typeof useBusinessFinance>;
}

const BusinessSettingsModal = ({ open, onClose, biz }: Props) => {
  const [businessType, setBusinessType] = useState<BusinessType>(biz.settings?.business_type || "mei");
  const [companyName, setCompanyName] = useState(biz.settings?.company_name || "");
  const [cnpj, setCnpj] = useState(biz.settings?.cnpj || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await biz.saveSettings(businessType, companyName, cnpj);
    toast.success("Configurações salvas!");
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações da Empresa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipo de empresa</Label>
            <Select value={businessType} onValueChange={v => setBusinessType(v as BusinessType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mei">MEI</SelectItem>
                <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                <SelectItem value="autonomo">Autônomo / Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome da empresa</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome da empresa" />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full btn-gradient py-4 rounded-xl">
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessSettingsModal;
