import { useState } from "react";
import { Calculator, Info, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tabela Simples Nacional 2026 - Anexo III (Serviços)
const FAIXAS_2026 = [
  { value: "1", label: "Faixa 1 – Até R$ 180.000", aliquota: 6.0, deducao: 0, faixa: "1ª Faixa" },
  { value: "2", label: "Faixa 2 – De R$ 180.001 a R$ 360.000", aliquota: 11.2, deducao: 9360, faixa: "2ª Faixa" },
  { value: "3", label: "Faixa 3 – De R$ 360.001 a R$ 720.000", aliquota: 13.5, deducao: 17640, faixa: "3ª Faixa" },
  { value: "4", label: "Faixa 4 – De R$ 720.001 a R$ 1.800.000", aliquota: 16.0, deducao: 35640, faixa: "4ª Faixa" },
  { value: "5", label: "Faixa 5 – De R$ 1.800.001 a R$ 3.600.000", aliquota: 21.0, deducao: 125640, faixa: "5ª Faixa" },
  { value: "6", label: "Faixa 6 – De R$ 3.600.001 a R$ 4.800.000", aliquota: 33.0, deducao: 648000, faixa: "6ª Faixa" },
];

// Anexos do Simples Nacional 2026
const ANEXOS = [
  { value: "1", label: "Anexo I – Comércio", descricao: "Venda de mercadorias" },
  { value: "2", label: "Anexo II – Indústria", descricao: "Fabricação de produtos" },
  { value: "3", label: "Anexo III – Serviços", descricao: "Prestação de serviços (geral)" },
  { value: "4", label: "Anexo IV – Serviços", descricao: "Limpeza, vigilância, construção" },
  { value: "5", label: "Anexo V – Serviços", descricao: "Tecnologia, medicina, advocacia" },
];

const SimplesCalculator = () => {
  const [faturamento, setFaturamento] = useState("");
  const [faixa, setFaixa] = useState("1");
  const [anexo, setAnexo] = useState("3");

  const faixaData = FAIXAS_2026.find(f => f.value === faixa)!;
  const fat = Number(faturamento) || 0;
  const rbt12 = fat * 12;
  
  // Cálculo da alíquota efetiva: (RBT12 × Alíquota - PD) / RBT12
  const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * faixaData.aliquota / 100) - faixaData.deducao) / rbt12 * 100 : 0;
  const impostoMensal = fat * (Math.max(aliquotaEfetiva, 0) / 100);

  // Detectar faixa automática baseada no RBT12
  const detectFaixa = (rbt: number): string => {
    if (rbt <= 180000) return "1";
    if (rbt <= 360000) return "2";
    if (rbt <= 720000) return "3";
    if (rbt <= 1800000) return "4";
    if (rbt <= 3600000) return "5";
    return "6";
  };

  const faixaDetectada = detectFaixa(rbt12);
  const anexoSelecionado = ANEXOS.find(a => a.value === anexo);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Calculadora Simples Nacional</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Tabela 2026</span>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Simples Nacional 2026</p>
            <p className="text-xs text-muted-foreground mt-1">
              Limite de faturamento: <strong>R$ 4.800.000/ano</strong>. 
              DAS unificado com vencimento no <strong>dia 20</strong> de cada mês.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Estimativa de Imposto</h4>
        </div>

        <div>
          <Label>Anexo do Simples Nacional</Label>
          <Select value={anexo} onValueChange={setAnexo}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{ANEXOS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
          {anexoSelecionado && (
            <p className="text-xs text-muted-foreground mt-1">{anexoSelecionado.descricao}</p>
          )}
        </div>

        <div>
          <Label>Faturamento Mensal (R$)</Label>
          <Input type="number" step="0.01" placeholder="10000.00" value={faturamento} onChange={e => setFaturamento(e.target.value)} className="mt-1" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Faixa de Tributação (RBT12)</Label>
            {fat > 0 && faixa !== faixaDetectada && (
              <button 
                onClick={() => setFaixa(faixaDetectada)} 
                className="text-xs text-primary hover:underline"
              >
                Usar faixa detectada
              </button>
            )}
          </div>
          <Select value={faixa} onValueChange={setFaixa}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{FAIXAS_2026.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {fat > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            {/* RBT12 */}
            <div className="glass-card p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">RBT12 (Receita Bruta 12 meses)</p>
              </div>
              <p className="text-lg font-bold text-foreground">R$ {rbt12.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">Faixa detectada: {FAIXAS_2026.find(f => f.value === faixaDetectada)?.faixa}</p>
            </div>

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

            {faixaData.deducao > 0 && (
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Parcela a Deduzir (PD)</p>
                <p className="text-base font-bold text-foreground">R$ {faixaData.deducao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
            )}

            <div className="glass-card p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">Imposto Mensal Estimado (DAS)</p>
              <p className="text-2xl font-bold text-primary">R$ {impostoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">Imposto Anual Estimado</p>
              <p className="text-lg font-bold text-foreground">R$ {(impostoMensal * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}

        {rbt12 > 4800000 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">Atenção: O faturamento anual ultrapassa o limite do Simples Nacional (R$ 4.800.000). Será necessário migrar para Lucro Presumido ou Real.</p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">Esta é uma estimativa simplificada baseada no Anexo III. Consulte seu contador para valores exatos considerando o fator R e outros ajustes.</p>
        </div>
      </div>

      {/* Datas Importantes */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Datas Importantes 2026</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">Vencimento DAS mensal</span>
            <span className="text-sm font-medium text-primary">Dia 20</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">Declaração DEFIS</span>
            <span className="text-sm font-medium text-primary">Até 31/03/2026</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">Recálculo anual de faixa</span>
            <span className="text-sm font-medium text-primary">Janeiro/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplesCalculator;
