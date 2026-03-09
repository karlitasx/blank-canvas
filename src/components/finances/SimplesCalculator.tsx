import { useState } from "react";
import { Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FAIXAS = [
  { value: "1", label: "Faixa 1 – Até R$ 180.000", aliquota: 6.0, deducao: 0 },
  { value: "2", label: "Faixa 2 – De R$ 180.001 a R$ 360.000", aliquota: 11.2, deducao: 9360 },
  { value: "3", label: "Faixa 3 – De R$ 360.001 a R$ 720.000", aliquota: 13.5, deducao: 17640 },
  { value: "4", label: "Faixa 4 – De R$ 720.001 a R$ 1.800.000", aliquota: 16.0, deducao: 35640 },
  { value: "5", label: "Faixa 5 – De R$ 1.800.001 a R$ 3.600.000", aliquota: 21.0, deducao: 125640 },
  { value: "6", label: "Faixa 6 – De R$ 3.600.001 a R$ 4.800.000", aliquota: 33.0, deducao: 648000 },
];

const SimplesCalculator = () => {
  const [faturamento, setFaturamento] = useState("");
  const [faixa, setFaixa] = useState("1");

  const faixaData = FAIXAS.find(f => f.value === faixa)!;
  const fat = Number(faturamento) || 0;
  const rbt12 = fat * 12;
  const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * faixaData.aliquota / 100) - faixaData.deducao) / rbt12 * 100 : 0;
  const impostoMensal = fat * (Math.max(aliquotaEfetiva, 0) / 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-bold text-foreground">Calculadora Simples Nacional</h3>

      <div className="glass-card p-5 rounded-xl space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Estimativa de Imposto</h4>
        </div>

        <div>
          <Label>Faturamento Mensal (R$)</Label>
          <Input type="number" step="0.01" placeholder="10000.00" value={faturamento} onChange={e => setFaturamento(e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Faixa de Tributação (RBT12)</Label>
          <Select value={faixa} onValueChange={setFaixa}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{FAIXAS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {fat > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Alíquota Nominal</p>
                <p className="text-lg font-bold text-foreground">{faixaData.aliquota}%</p>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Alíquota Efetiva</p>
                <p className="text-lg font-bold text-primary">{Math.max(aliquotaEfetiva, 0).toFixed(2)}%</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">Imposto Mensal Estimado</p>
              <p className="text-2xl font-bold text-primary">R$ {impostoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">Imposto Anual Estimado</p>
              <p className="text-lg font-bold text-foreground">R$ {(impostoMensal * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">Esta é uma estimativa simplificada. Consulte seu contador para valores exatos.</p>
        </div>
      </div>
    </div>
  );
};

export default SimplesCalculator;
