import { Calculator, Info, Calendar, TrendingUp, Receipt, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusinessSales } from "@/hooks/useBusinessSales";
import { useBusinessExpenses } from "@/hooks/useBusinessExpenses";

// Valores atualizados para 2026
const SALARIO_MINIMO_2026 = 1518;
const TETO_INSS_2026 = 8157.41; // Teto INSS 2026 estimado
const INSS_ALIQUOTA = 0.20; // 20% para contribuinte individual
const ISS_ALIQUOTA = 0.05; // 5% ISS (varia por município)

// Tabela IRPF 2026 (valores estimados)
const TABELA_IRPF_2026 = [
  { limite: 2428.80, aliquota: 0, deducao: 0 },
  { limite: 3642.45, aliquota: 0.075, deducao: 182.16 },
  { limite: 4852.62, aliquota: 0.15, deducao: 455.36 },
  { limite: 6062.79, aliquota: 0.225, deducao: 819.30 },
  { limite: Infinity, aliquota: 0.275, deducao: 1122.30 },
];

const AutonomoFeatures = () => {
  const { monthlyTotal: revenue, yearlyTotal } = useBusinessSales();
  const { monthlyTotal: expenses } = useBusinessExpenses();
  const [simulacao, setSimulacao] = useState("");

  const rendimentoMensal = Number(simulacao) || revenue;
  const lucro = rendimentoMensal - expenses;

  // Cálculo INSS
  const inssBase = Math.min(rendimentoMensal, TETO_INSS_2026);
  const inss = inssBase * INSS_ALIQUOTA;

  // Cálculo ISS
  const iss = rendimentoMensal * ISS_ALIQUOTA;

  // Base para IRPF (rendimento - INSS - ISS)
  const baseIrpf = Math.max(rendimentoMensal - inss, 0);
  
  // Cálculo IRPF
  const calcularIrpf = (base: number): number => {
    const faixa = TABELA_IRPF_2026.find(f => base <= f.limite);
    if (!faixa) return 0;
    return Math.max((base * faixa.aliquota) - faixa.deducao, 0);
  };
  
  const irpf = calcularIrpf(baseIrpf);
  const totalImpostos = inss + iss + irpf;
  const liquido = rendimentoMensal - totalImpostos;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Recursos Autônomo / Freelancer</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Valores 2026</span>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Impostos Autônomo 2026</p>
            <p className="text-xs text-muted-foreground mt-1">
              Salário mínimo: <strong>R$ {SALARIO_MINIMO_2026.toLocaleString("pt-BR")}</strong> · 
              Teto INSS: <strong>R$ {TETO_INSS_2026.toLocaleString("pt-BR")}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Resumo do Mês */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Resumo do Mês</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Rendimentos</p>
            <p className="text-lg font-bold text-foreground">R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="text-lg font-bold text-foreground">R$ {expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lucro</p>
            <p className={`text-lg font-bold ${lucro >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Anual</p>
            <p className="text-lg font-bold text-foreground">R$ {yearlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Calculadora de Impostos */}
      <div className="glass-card p-5 rounded-xl space-y-5">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Calculadora de Impostos</h4>
        </div>

        <div>
          <Label>Rendimento Mensal (R$)</Label>
          <Input 
            type="number" 
            step="0.01" 
            placeholder={revenue.toFixed(2)} 
            value={simulacao} 
            onChange={e => setSimulacao(e.target.value)} 
            className="mt-1" 
          />
          <p className="text-xs text-muted-foreground mt-1">Deixe vazio para usar o faturamento registrado</p>
        </div>

        {rendimentoMensal > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            {/* INSS */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">INSS (20%)</p>
                <p className="text-xs text-muted-foreground">Base: R$ {inssBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-base font-bold text-foreground">R$ {inss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>

            {/* ISS */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">ISS (~5%)</p>
                <p className="text-xs text-muted-foreground">Varia por município</p>
              </div>
              <p className="text-base font-bold text-foreground">R$ {iss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>

            {/* IRPF */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">IRPF (carnê-leão)</p>
                <p className="text-xs text-muted-foreground">Base: R$ {baseIrpf.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-base font-bold text-foreground">R$ {irpf.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>

            {/* Total */}
            <div className="glass-card p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-muted-foreground">Total de Impostos</p>
              <p className="text-2xl font-bold text-amber-600">R$ {totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalImpostos / rendimentoMensal) * 100).toFixed(1)}% do rendimento
              </p>
            </div>

            {/* Líquido */}
            <div className="glass-card p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground">Rendimento Líquido</p>
              <p className="text-2xl font-bold text-emerald-600">R$ {liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}

        {/* Comparativo MEI */}
        {rendimentoMensal > 0 && rendimentoMensal * 12 <= 81000 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <AlertTriangle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">💡 Você poderia economizar como MEI!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Como MEI, você pagaria apenas R$ 75,90/mês (DAS 2026) em vez de R$ {totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.
                Economia de R$ {(totalImpostos - 75.90).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês!
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">Valores estimados. IRPF considera tabela progressiva 2026. Consulte seu contador para cálculos precisos.</p>
        </div>
      </div>

      {/* Obrigações */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Obrigações Fiscais 2026</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">INSS (GPS/DARF)</span>
            <span className="text-sm font-medium text-primary">Dia 15</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">Carnê-Leão (DARF)</span>
            <span className="text-sm font-medium text-primary">Último dia útil</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">ISS (varia por município)</span>
            <span className="text-sm font-medium text-primary">Dia 10-15</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">Declaração IRPF</span>
            <span className="text-sm font-medium text-primary">Até 30/04/2026</span>
          </div>
        </div>
      </div>

      {/* Dica de Formalização */}
      <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Receipt className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Considere se formalizar</p>
            <p className="text-xs text-muted-foreground mt-1">
              Se seu faturamento anual for até R$ 81.000, o MEI oferece impostos menores, 
              aposentadoria garantida e menos burocracia. Acima desse valor, o Simples Nacional 
              pode ser mais vantajoso que pagar como autônomo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomoFeatures;
